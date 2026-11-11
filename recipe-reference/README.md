# Runtime recipe reference

This directory is populated by:

```powershell
tools\recipes.cmd snapshot -Instance "C:\path\to\development-instance"
```

The generated snapshot is intentionally compact enough to keep with the pack source. ProbeJS
registry types are separated into items, tags, fluids, recipe types, recipe IDs, mod IDs, and
Mekanism chemicals so the audit can validate each identifier against the correct registry.
Any available KubeJS recipe export is also normalized. Do not manually add guessed identifiers
here; regenerate the snapshot from a successfully loaded instance.
