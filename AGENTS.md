# Arcane Horizons contributor guidance

## Pack baseline

- Minecraft 1.21.1
- NeoForge 21.1.249
- KubeJS `2101.7.2-build.374`
- Packwiz is the source of truth for distributed files and mod versions.
- The repository is pack source, not necessarily the runnable Minecraft instance.

## Recipe work

1. Read `docs/RECIPE_TOOLING.md` before changing recipes.
2. Run `tools\recipes.cmd check` before and after every recipe change.
3. Treat `recipe-reference/` as the authoritative runtime snapshot when it is current.
4. Never invent item, fluid, tag, recipe-type, or recipe identifiers. Confirm them in
   `recipe-reference/`, ProbeJS output, a mod's installed recipe JSON, or the running game.
5. Give every added recipe an explicit, stable ID in the `arcane_horizons` namespace unless
   intentionally replacing a third-party recipe at its original ID.
6. Prefer removal by exact recipe ID. Broad output/input/type removals require a comment
   explaining why every matched recipe should be removed.
7. A script that replaces an output owns that output. Do not replace the same output in a
   second script merely to rely on filename load order.
8. After changing custom recipe JSON or cross-mod recipes, validate in the development
   instance with `/reload` and inspect `logs/kubejs/server.log` and `logs/latest.log`.
9. Startup-script item changes require a full game restart; `/reload` is not sufficient.

## Safety and generated files

- Do not hand-edit `index.toml` or the hash in `pack.toml`; use `packwiz refresh`.
- Do not commit mod JARs.
- ProbeJS is a development dependency and must not become a required player mod.
- Refresh the recipe snapshot after changing mods, Minecraft/NeoForge/KubeJS versions, or
  startup registrations.
- Preserve unrelated worktree changes. Recipe tooling reports go under `reports/` and are
  intentionally not distributed by Packwiz.
