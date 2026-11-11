import fs from 'node:fs';
import path from 'node:path';

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const token = process.argv[i];
  if (token.startsWith('--')) {
    const value = process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true;
    args.set(token, value);
  }
}

const instance = path.resolve(String(args.get('--instance') || ''));
const expectedAdded = args.has('--expected-added') ? Number(args.get('--expected-added')) : null;
const serverLogPath = path.join(instance, 'logs', 'kubejs', 'server.log');
const startupLogPath = path.join(instance, 'logs', 'kubejs', 'startup.log');
const latestLogPath = path.join(instance, 'logs', 'latest.log');
const failures = [];
const warnings = [];

if (!fs.existsSync(serverLogPath)) {
  console.error(`KubeJS server log not found: ${serverLogPath}`);
  process.exit(2);
}

const serverLog = fs.readFileSync(serverLogPath, 'utf8');
const cycleStart = serverLog.lastIndexOf('Initializing recipe event...');
if (cycleStart < 0) failures.push('no completed KubeJS recipe cycle was found');
const cycle = cycleStart < 0 ? serverLog : serverLog.slice(cycleStart);
const summaryMatches = [...cycle.matchAll(/Added ([\d,]+) recipes, removed ([\d,]+) recipes, modified ([\d,]+) recipes, with ([\d,]+) failed recipes/g)];
const summary = summaryMatches.at(-1);
if (!summary) failures.push('the latest KubeJS recipe cycle has no completion summary');
else {
  const [added, removed, modified, failed] = summary.slice(1).map(value => Number(value.replaceAll(',', '')));
  console.log(`RUNTIME ${added} added, ${removed} removed, ${modified} modified, ${failed} failed recipes`);
  if (failed !== 0) failures.push(`${failed} custom recipe(s) failed to load`);
  if (Number.isFinite(expectedAdded) && added !== expectedAdded) failures.push(`runtime added ${added} recipes but the offline audit generated ${expectedAdded}`);
}

const serverErrors = cycle.split(/\r?\n/).filter(line => /\[ERROR\]/.test(line));
for (const line of serverErrors) failures.push(`KubeJS server error: ${line.trim()}`);
if (/KubeJS has found two recipes with the same ID/i.test(cycle)) failures.push('KubeJS reported duplicate custom recipe IDs');

if (fs.existsSync(startupLogPath)) {
  const startupLog = fs.readFileSync(startupLogPath, 'utf8');
  const startupErrors = startupLog.split(/\r?\n/).filter(line => /\[ERROR\]/.test(line));
  for (const line of startupErrors) failures.push(`KubeJS startup error: ${line.trim()}`);
}

if (fs.existsSync(latestLogPath)) {
  const latestLog = fs.readFileSync(latestLogPath, 'utf8');
  const latestCycleStart = latestLog.lastIndexOf('Initializing recipe event...');
  const latestCycle = latestCycleStart < 0 ? latestLog : latestLog.slice(latestCycleStart);
  const arcaneParseErrors = latestCycle.split(/\r?\n/).filter(line => /Error parsing recipe (arcane_horizons|kubejs):/i.test(line));
  for (const line of arcaneParseErrors) failures.push(`custom recipe parse error: ${line.trim()}`);
  const allParseErrors = latestCycle.match(/Error parsing recipe /g)?.length || 0;
  if (allParseErrors > arcaneParseErrors.length) warnings.push(`${allParseErrors - arcaneParseErrors.length} third-party recipe JSON(s) failed to parse in the latest cycle`);
}

for (const warning of warnings) console.log(`WARN  ${warning}`);
for (const failure of failures) console.error(`ERROR ${failure}`);
if (failures.length) {
  console.error(`FAIL  runtime audit (${failures.length} error(s), ${warnings.length} warning(s))`);
  process.exit(1);
}
console.log(`PASS  runtime audit (${warnings.length} warning(s))`);
