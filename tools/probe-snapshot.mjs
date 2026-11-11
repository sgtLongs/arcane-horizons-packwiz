import crypto from 'node:crypto';
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

const root = path.resolve(String(args.get('--root') || '.'));
const instance = path.resolve(String(args.get('--instance') || ''));
const reference = path.join(root, 'recipe-reference');

function walk(directory, predicate = () => true) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full, predicate) : predicate(full) ? [full] : [];
  });
}

const probeCandidates = [
  path.join(instance, '.probe'),
  path.join(instance, 'kubejs', 'probe')
];
const probeDirectory = probeCandidates.find(candidate => fs.existsSync(candidate));
const exportCandidates = [
  path.join(instance, 'local', 'kubejs', 'export'),
  path.join(instance, 'kubejs', 'export')
];
const exportDirectory = exportCandidates.find(candidate => fs.existsSync(candidate));

console.log(`Instance: ${instance}`);
console.log(`ProbeJS dump: ${probeDirectory || 'NOT FOUND'}`);
console.log(`KubeJS export: ${exportDirectory || 'not found (optional)'}`);

if (args.has('--status')) process.exit(probeDirectory ? 0 : 2);
if (!args.has('--write')) process.exit(0);
if (!probeDirectory) {
  console.error('ProbeJS output was not found. Run the ProbeJS dump in a loaded single-player world first.');
  process.exit(2);
}

const declarations = walk(probeDirectory, file => file.endsWith('.d.ts') || file.endsWith('.json'));
const specialTypesFile = path.join(probeDirectory, '@special', 'types', 'index.d.ts');
if (!fs.existsSync(specialTypesFile)) {
  console.error(`ProbeJS registry types were not found: ${specialTypesFile}`);
  process.exit(2);
}

const typeOutputs = new Map([
  ['Item', 'items.txt'],
  ['ItemTag', 'item-tags.txt'],
  ['Fluid', 'fluids.txt'],
  ['FluidTag', 'fluid-tags.txt'],
  ['RecipeType', 'recipe-types.txt'],
  ['RecipeSerializer', 'recipe-serializers.txt'],
  ['RecipeId', 'recipe-ids.txt'],
  ['ModId', 'mod-ids.txt'],
  ['MekanismChemical', 'mekanism-chemicals.txt'],
  ['MekanismChemicalTag', 'mekanism-chemical-tags.txt']
]);
const typeValues = new Map();
const specialTypes = fs.readFileSync(specialTypesFile, 'utf8');
for (const [typeName] of typeOutputs) {
  const match = specialTypes.match(new RegExp(`^\\s*type\\s+${typeName}\\s*=\\s*(.*);\\s*$`, 'm'));
  if (!match) {
    console.error(`ProbeJS type '${typeName}' was not found in ${specialTypesFile}`);
    process.exit(2);
  }
  typeValues.set(typeName, [...match[1].matchAll(/"([^"]+)"/g)].map(value => value[1]).sort());
}

const recipeLines = [];
if (exportDirectory) {
  for (const file of walk(exportDirectory, file => file.endsWith('.json'))) {
    const relative = path.relative(exportDirectory, file).replaceAll('\\', '/');
    try {
      const json = JSON.parse(fs.readFileSync(file, 'utf8'));
      recipeLines.push(JSON.stringify({ path: relative, recipe: json }));
    } catch (error) {
      console.warn(`Skipping invalid exported JSON ${relative}: ${error.message}`);
    }
  }
}

const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
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
const manifest = {
  format: 1,
  generatedAtUtc: new Date().toISOString(),
  packTomlSha256: sha256(path.join(root, 'pack.toml')),
  indexTomlSha256: sha256(path.join(root, 'index.toml')),
  startupScriptsSha256: hashFiles(walk(path.join(root, 'kubejs', 'startup_scripts'), file => file.endsWith('.js'))),
  probeDeclarationFiles: declarations.length,
  registryCounts: Object.fromEntries([...typeValues].map(([name, values]) => [name, values.length])),
  exportedRecipeFiles: recipeLines.length
};

fs.mkdirSync(reference, { recursive: true });
fs.writeFileSync(path.join(reference, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
for (const [typeName, fileName] of typeOutputs) {
  fs.writeFileSync(path.join(reference, fileName), typeValues.get(typeName).join('\n') + '\n');
}
const legacyResourceFile = path.join(reference, 'resource-identifiers.txt');
if (fs.existsSync(legacyResourceFile)) fs.rmSync(legacyResourceFile);
if (recipeLines.length) fs.writeFileSync(path.join(reference, 'recipes.jsonl'), recipeLines.sort().join('\n') + '\n');

console.log(`WROTE ${typeValues.get('Item').length} items, ${typeValues.get('ItemTag').length} item tags, ${typeValues.get('Fluid').length} fluids, and ${typeValues.get('RecipeType').length} recipe types`);
if (recipeLines.length) console.log(`WROTE ${recipeLines.length} exported recipe JSON files`);
