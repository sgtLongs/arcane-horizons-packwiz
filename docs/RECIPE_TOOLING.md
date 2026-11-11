# Recipe tooling

The recipe tools combine three levels of confidence:

1. **Static audit** executes recipe scripts against a harmless mock KubeJS event. It expands
   loops and helper calls, then checks explicit IDs, shaped patterns, duplicate recipe IDs,
   and basic resource-location syntax. It does not start Minecraft.
2. **ProbeJS snapshot** extracts resource identifiers and type information from the exact
   mod set that successfully loaded in the development instance.
3. **Minecraft validation** reloads recipes in the real game and catches serializer,
   registry, tag, component, and mod-integration errors that no offline mock can prove.

## Commands

Run these from any directory:

```powershell
.\tools\recipes.cmd check
.\tools\recipes.cmd graph
.\tools\recipes.cmd probe-status -Instance "C:\path\to\the\instance"
.\tools\recipes.cmd snapshot -Instance "C:\path\to\the\instance"
.\tools\recipes.cmd runtime-check -Instance "C:\path\to\the\instance"
```

`check` performs JavaScript syntax checks, verifies Packwiz can read the pack, and runs the
recipe audit. `graph` writes `reports/recipe-graph.mmd`, a Mermaid dependency graph of the
custom recipes the offline harness can observe.

`snapshot` reads the instance's `.probe` output and, when present, KubeJS recipe exports. It
writes normalized, reviewable files under `recipe-reference/`. The snapshot manifest records
the hashes of `pack.toml` and `index.toml`, allowing `check` to warn when the reference was
made from a different pack state.

`runtime-check` examines the latest KubeJS recipe cycle in the development instance. It fails
on KubeJS script errors, duplicate custom IDs, failed custom recipes, and Arcane Horizons
recipe parse failures. It also requires the runtime added-recipe count to equal the offline
audit's generated-recipe count. It reports third-party recipe parsing errors separately because many
mods ship optional compatibility recipes for mods that are not installed.

## What ProbeJS does

ProbeJS runs inside Minecraft alongside KubeJS. It inspects the classes, events, registries,
recipe schemas, and integrations that are present after this particular pack loads. Its dump
generates TypeScript declarations used by VS Code for completion and diagnostics. This is
substantially more accurate than copying examples from a wiki because addon methods and
custom recipe schemas can differ by Minecraft and mod version.

ProbeJS also provides a VS Code extension and an in-game interface. Useful capabilities
include:

- completion for KubeJS events and Java classes;
- completion and hover information for registry identifiers;
- insertion of installed recipe JSON as a starting point;
- tag and registry browsing through Kubedex;
- ProbeJS linting for KubeJS-specific script issues;
- generated per-script-type projects, so startup, server, and client bindings are not mixed.

ProbeJS does not prove gameplay balance, recipe reachability, or that a broad removal matched
the intended recipes. The repository audit and progression graph cover those concerns.

## Development-instance setup

ProbeJS should be installed only in a dedicated development instance:

1. Install the ProbeJS build for Minecraft 1.21.1 and NeoForge that matches the installed
   KubeJS generation. Pin the version after it successfully dumps this pack.
2. Start the pack and enter a single-player world.
3. Run `/probejs`, choose **Dump**, and wait for completion. Some versions also accept
   `/probejs dump` directly.
4. Exit the world after the dump finishes so files are fully flushed.
5. Run `tools\recipes.cmd snapshot -Instance "<instance path>"` in this repository.
6. Open the instance root (the parent of `kubejs/`) in VS Code to use the generated typings.

Do not copy the ProbeJS JAR into this repository. The repository contains only its compact
derived reference snapshot.

## Real-game validation

After changing server recipes:

1. Copy or synchronize the repository's `kubejs/` directory into the development instance.
2. Enter a world and run `/reload`.
3. Confirm chat reports no KubeJS errors.
4. Inspect `logs/kubejs/server.log` and `logs/latest.log` for recipe parsing failures,
   duplicate IDs, missing registry entries, and serializer errors.
5. Inspect affected recipes in JEI and test at least one recipe from each changed machine
   type. Startup registration changes require a full restart first.

## Tool limitations

The offline harness intentionally mocks `Platform.isLoaded()` as true so optional branches
are audited. It can detect malformed shaped recipes and duplicate generated IDs, but it cannot
perfectly emulate Rhino or a mod's recipe serializer. Minecraft remains the final authority.
