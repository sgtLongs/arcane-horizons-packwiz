import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const token = process.argv[i];
  if (token.startsWith('--')) {
    const value = process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true;
    args.set(token, value);
  }
}

const root = path.resolve(String(args.get('--root') || '.'));
const scriptRoot = path.join(root, 'kubejs', 'server_scripts');
const records = [];
const removals = [];
const failures = [];
const warnings = [];
let currentFile = '';

function walk(directory, suffix) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full, suffix) : entry.name.endsWith(suffix) ? [full] : [];
  });
}

function builder(record) {
  let proxy;
  const callable = () => proxy;
  proxy = new Proxy(callable, {
    apply() { return proxy; },
    get(_target, property) {
      if (property === 'id') {
        return id => {
          record.id = String(id);
          return proxy;
        };
      }
      if (property === 'toJSON') return () => record;
      if (property === Symbol.toPrimitive) return () => '[RecipeBuilder]';
      return (..._values) => proxy;
    }
  });
  return proxy;
}

function addRecord(kind, values, customJson = null) {
  const record = { kind, values, customJson, file: currentFile, id: null };
  records.push(record);
  return builder(record);
}

function recipeNamespace(parts = []) {
  let proxy;
  const callable = (...values) => addRecord(parts.join('.'), values);
  proxy = new Proxy(callable, {
    apply(_target, _thisArg, values) { return addRecord(parts.join('.'), values); },
    get(_target, property) {
      if (property === Symbol.toPrimitive) return () => parts.join('.');
      return recipeNamespace([...parts, String(property)]);
    }
  });
  return proxy;
}

function makeRecipeEvent() {
  return new Proxy({}, {
    get(_target, property) {
      if (property === 'recipes') return recipeNamespace(['recipes']);
      if (property === 'remove') {
        return filter => removals.push({ filter, file: currentFile });
      }
      if (property === 'custom') {
        return json => addRecord(String(json?.type || 'custom'), [json], json);
      }
      return (...values) => addRecord(String(property), values);
    }
  });
}

function fluentValue(valueFactory = (...values) => ({ values })) {
  let proxy;
  const callable = (...values) => valueFactory(...values);
  proxy = new Proxy(callable, {
    apply(_target, _thisArg, values) { return valueFactory(...values); },
    get() { return proxy; }
  });
  return proxy;
}

const context = vm.createContext({
  ServerEvents: { recipes: callback => callback(makeRecipeEvent()) },
  Platform: { isLoaded: () => true },
  Fluid: { of: (id, amount) => ({ fluid: String(id), amount }) },
  Item: { of: (id, count) => ({ item: String(id), count }) },
  Ingredient: { of: value => value },
  JsonIO: { read: () => null, write: () => undefined },
  console: { log() {}, info() {}, warn() {}, error() {} },
  global: {},
  Java: fluentValue(),
  Utils: fluentValue(),
  Text: fluentValue(),
  Component: fluentValue()
});

for (const file of walk(scriptRoot, '.js').sort()) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes('ServerEvents.recipes')) continue;
  currentFile = path.relative(root, file).replaceAll('\\', '/');
  try {
    vm.runInContext(source, context, { filename: currentFile, timeout: 5000 });
  } catch (error) {
    failures.push(`${currentFile}: offline execution failed: ${error.message}`);
  }
}

function resourceId(value) {
  if (typeof value !== 'string') return null;
  const stripped = value.replace(/^\d+x\s+/, '').replace(/^#/, '');
  return /^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(stripped) ? stripped : null;
}

function parsedResource(value) {
  if (typeof value !== 'string') return null;
  const withoutCount = value.replace(/^\d+x\s+/, '');
  const isTag = withoutCount.startsWith('#');
  const id = withoutCount.replace(/^#/, '');
  return /^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(id) ? { id, isTag } : null;
}

function outputOf(record) {
  if (record.kind === 'shaped' || record.kind === 'shapeless' || record.kind === 'smelting' ||
      record.kind === 'blasting' || record.kind === 'smoking' || record.kind === 'campfireCooking' ||
      record.kind === 'stonecutting') {
    return resourceId(record.values[0]);
  }
  if (record.kind.startsWith('recipes.')) {
    const first = record.values[0];
    if (typeof first === 'string') return resourceId(first);
    if (Array.isArray(first)) return resourceId(first.find(value => typeof value === 'string'));
  }
  if (record.customJson) {
    const candidates = [record.customJson.result, record.customJson.output, record.customJson.results];
    for (const candidate of candidates.flat(2)) {
      if (typeof candidate === 'string' && resourceId(candidate)) return resourceId(candidate);
      if (candidate && typeof candidate === 'object') {
        const id = candidate.id || candidate.item || candidate.fluid || candidate.chemical;
        if (resourceId(id)) return resourceId(id);
      }
    }
  }
  return null;
}

function collectResources(value, found = new Set()) {
  if (typeof value === 'string') {
    const id = resourceId(value);
    if (id) found.add(id);
  } else if (Array.isArray(value)) {
    value.forEach(item => collectResources(item, found));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach(item => collectResources(item, found));
  }
  return found;
}

for (const record of records) {
  if (!record.id) warnings.push(`${record.file}: ${record.kind} recipe has no explicit ID`);
  if (record.kind !== 'shaped') continue;
  const pattern = record.values[1];
  const key = record.values[2];
  if (!Array.isArray(pattern) || !key || typeof key !== 'object') {
    failures.push(`${record.file}: shaped recipe ${record.id || '<unidentified>'} has an invalid pattern or key`);
    continue;
  }
  if (pattern.length < 1 || pattern.length > 3 || pattern.some(row => typeof row !== 'string' || row.length < 1 || row.length > 3)) {
    failures.push(`${record.file}: shaped recipe ${record.id || '<unidentified>'} is outside the 1x1 to 3x3 crafting grid`);
  }
  const widths = new Set(pattern.map(row => row.length));
  if (widths.size > 1) failures.push(`${record.file}: shaped recipe ${record.id || '<unidentified>'} has unequal row widths`);
  const used = new Set(pattern.join('').replaceAll(' ', '').split(''));
  const defined = new Set(Object.keys(key));
  for (const symbol of used) if (!defined.has(symbol)) failures.push(`${record.file}: shaped recipe ${record.id || '<unidentified>'} does not define '${symbol}'`);
  for (const symbol of defined) if (!used.has(symbol)) warnings.push(`${record.file}: shaped recipe ${record.id || '<unidentified>'} defines unused '${symbol}'`);
}

const byId = new Map();
for (const record of records.filter(record => record.id)) {
  const existing = byId.get(record.id);
  if (existing) failures.push(`duplicate recipe ID ${record.id}: ${existing.file} and ${record.file}`);
  else byId.set(record.id, record);
}

const broadRemovalsByFile = new Map();
for (const removal of removals) {
  if (removal.filter && typeof removal.filter === 'object' && !Array.isArray(removal.filter)) {
    if (!('id' in removal.filter) && ('output' in removal.filter || 'input' in removal.filter || 'type' in removal.filter)) {
      const values = broadRemovalsByFile.get(removal.file) || [];
      values.push(removal.filter);
      broadRemovalsByFile.set(removal.file, values);
    }
  }
}

for (const [file, filters] of broadRemovalsByFile) {
  const examples = filters.slice(0, 3).map(filter => JSON.stringify(filter)).join(', ');
  const remainder = filters.length > 3 ? `, plus ${filters.length - 3} more` : '';
  warnings.push(`${file}: ${filters.length} broad removal(s): ${examples}${remainder}`);
}

const outputOwners = new Map();
for (const record of records) {
  const output = outputOf(record);
  if (!output) continue;
  const owners = outputOwners.get(output) || new Set();
  owners.add(record.file);
  outputOwners.set(output, owners);
}
for (const [output, owners] of outputOwners) {
  if (owners.size > 1) warnings.push(`output ${output} is added by multiple scripts: ${[...owners].join(', ')}`);
}

const snapshotManifest = path.join(root, 'recipe-reference', 'manifest.json');
if (fs.existsSync(snapshotManifest)) {
  const snapshot = JSON.parse(fs.readFileSync(snapshotManifest, 'utf8'));
  const crypto = await import('node:crypto');
  const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const hashFiles = files => {
    const digest = crypto.createHash('sha256');
    for (const file of files.sort()) {
      digest.update(path.relative(root, file).replaceAll('\\', '/'));
      digest.update('\0');
      digest.update(fs.readFileSync(file));
      digest.update('\0');
    }
    return digest.digest('hex');
  };
  const startupScriptsHash = hashFiles(walk(path.join(root, 'kubejs', 'startup_scripts'), '.js'));
  const snapshotCurrent = snapshot.packTomlSha256 === hash(path.join(root, 'pack.toml')) &&
    snapshot.indexTomlSha256 === hash(path.join(root, 'index.toml')) &&
    snapshot.startupScriptsSha256 === startupScriptsHash;
  if (!snapshotCurrent) {
    warnings.push('recipe-reference snapshot is stale for the current pack.toml/index.toml');
  } else {
    const readSet = name => {
      const file = path.join(root, 'recipe-reference', name);
      return fs.existsSync(file) ? new Set(fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean)) : null;
    };
    const items = readSet('items.txt');
    const itemTags = readSet('item-tags.txt');
    const recipeTypes = readSet('recipe-types.txt');
    const recipeSerializers = readSet('recipe-serializers.txt');
    if (items && itemTags && recipeTypes && recipeSerializers) {
      const checked = new Set();
      const validateItem = (value, record, role) => {
        const parsed = parsedResource(value);
        if (!parsed) return;
        const key = `${parsed.isTag ? 'tag' : 'item'}:${parsed.id}:${record.file}:${record.id}:${role}`;
        if (checked.has(key)) return;
        checked.add(key);
        const registry = parsed.isTag ? itemTags : items;
        if (!registry.has(parsed.id)) failures.push(`${record.file}: ${record.id || '<unidentified>'} references unknown ${parsed.isTag ? 'item tag' : 'item'} ${parsed.id} (${role})`);
      };
      const validateIngredient = (value, record) => {
        if (typeof value === 'string') return validateItem(value, record, 'ingredient');
        if (Array.isArray(value)) return value.forEach(entry => validateIngredient(entry, record));
        if (!value || typeof value !== 'object') return;
        if (value.item) validateItem(value.item, record, 'ingredient');
        if (value.items) validateIngredient(value.items, record);
        if (value.tag) validateItem(`#${value.tag}`, record, 'ingredient');
        if (value.ingredient) validateIngredient(value.ingredient, record);
      };
      for (const record of records) {
        if (record.kind === 'shaped') {
          validateItem(record.values[0], record, 'output');
          Object.values(record.values[2] || {}).forEach(value => validateIngredient(value, record));
        } else if (record.kind === 'shapeless') {
          validateItem(record.values[0], record, 'output');
          validateIngredient(record.values[1], record);
        } else if (['smelting', 'blasting', 'smoking', 'campfireCooking', 'stonecutting'].includes(record.kind)) {
          validateItem(record.values[0], record, 'output');
          validateIngredient(record.values[1], record);
        }

        if (record.customJson?.type) {
          const serializer = String(record.customJson.type);
          if (!recipeSerializers.has(serializer)) failures.push(`${record.file}: ${record.id || '<unidentified>'} uses unknown recipe serializer ${serializer}`);
        } else if (record.kind.startsWith('recipes.')) {
          const parts = record.kind.split('.');
          const recipeType = parts.length >= 3 ? `${parts[1]}:${parts.slice(2).join('.')}` : null;
          if (recipeType && !recipeTypes.has(recipeType)) failures.push(`${record.file}: ${record.id || '<unidentified>'} uses unknown recipe type ${recipeType}`);
        }
      }
    } else {
      warnings.push('recipe-reference snapshot uses the legacy unclassified format; regenerate it with recipes.cmd snapshot');
    }
  }
}

if (args.has('--graph')) {
  const graphPath = path.resolve(String(args.get('--graph')));
  const lines = ['flowchart LR'];
  const nodeIds = new Map();
  let nextNode = 0;
  const node = id => {
    if (!nodeIds.has(id)) nodeIds.set(id, `n${nextNode++}`);
    return nodeIds.get(id);
  };
  for (const record of records) {
    const output = outputOf(record);
    if (!output) continue;
    const resources = collectResources(record.values);
    resources.delete(output);
    lines.push(`  ${node(output)}["${output}"]`);
    for (const input of [...resources].sort()) {
      lines.push(`  ${node(input)}["${input}"] --> ${node(output)}`);
    }
  }
  fs.mkdirSync(path.dirname(graphPath), { recursive: true });
  fs.writeFileSync(graphPath, [...new Set(lines)].join('\n') + '\n');
}

if (args.has('--count-only')) {
  if (failures.length) process.exit(1);
  console.log(records.length);
  process.exit(0);
}

console.log(`AUDIT ${records.length} added recipes, ${removals.length} removal operations, ${byId.size} explicit IDs`);
for (const warning of warnings) console.log(`WARN  ${warning}`);
for (const failure of failures) console.error(`ERROR ${failure}`);
if (failures.length) {
  console.error(`FAIL  ${failures.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}
console.log(`PASS  recipe audit (${warnings.length} warning(s))`);
