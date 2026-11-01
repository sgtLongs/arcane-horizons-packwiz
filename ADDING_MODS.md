# Adding Mods to Arcane Horizons

This pack uses [Packwiz](https://packwiz.infra.link/) metadata stored in GitHub. The bootstrapper reads `pack.toml`, follows it to `index.toml`, and then downloads any new or changed files when a player launches the instance.

The bootstrap URL for this repository is:

```text
https://raw.githubusercontent.com/sgtLongs/arcane-horizons-packwiz/main/pack.toml
```

Adding a mod therefore means using Packwiz to create a `mods/<name>.pw.toml` file, refreshing the index, and pushing all generated metadata to the `main` branch. Do **not** commit the mod's `.jar` file.

## Pack requirements

- Minecraft: `1.21.1`
- Mod loader: NeoForge
- NeoForge version: `21.1.249`
- Packwiz must be installed and available as `packwiz` in PowerShell.

Before adding anything, confirm that the mod and its dependencies support Minecraft 1.21.1 and NeoForge. Also check whether it belongs on both the client and server or only one side.

## Add a mod

Open PowerShell in the repository root:

```powershell
cd C:\MinecraftModpack
git pull --ff-only
```

Use the command for the mod's hosting site. Prefer Modrinth or CurseForge because Packwiz can record update information and usually resolve dependencies.

### From Modrinth

Pass a Modrinth project URL, slug, or project ID:

```powershell
packwiz modrinth add <modrinth-url-or-slug>
```

Example:

```powershell
packwiz modrinth add jade
```

### From CurseForge

Pass a CurseForge project URL, slug, or project ID:

```powershell
packwiz curseforge add <curseforge-url-or-slug>
```

Using the full project URL is safest when similarly named projects exist.

### From a GitHub release

For a mod distributed as a GitHub release asset:

```powershell
packwiz github add <owner/repository>
```

If the release contains several assets, use `--regex` to select the NeoForge 1.21.1 JAR. Run `packwiz github add --help` for the available options.

### From another direct download URL

Use this only when the mod is not supported by one of the commands above:

```powershell
packwiz url add "<display name>" "<direct-jar-download-url>" --meta-folder mods
```

The URL must download the actual JAR without requiring a login. A direct-URL entry will not automatically discover newer releases, so it must be replaced manually when the mod is updated.

## Refresh and inspect the generated files

Run:

```powershell
packwiz refresh
git status --short
git diff -- pack.toml index.toml mods
```

For a normal mod addition, expect these changes:

- A new `mods/<mod-name>.pw.toml` file.
- A new entry in `index.toml`.
- A new index hash in `pack.toml`.
- Possibly more `.pw.toml` files if Packwiz added required dependencies.

The generated mod metadata should name the correct 1.21.1 NeoForge JAR and contain a download URL and hash. Modrinth and CurseForge entries should also contain an `[update]` section.

Do not hand-edit the hash in `pack.toml` or entries in `index.toml`; `packwiz refresh` calculates them.

## Test before publishing

At minimum, verify that Packwiz can read the pack:

```powershell
packwiz list
```

For a complete test, start a temporary local Packwiz server:

```powershell
packwiz serve
```

Point a test instance's Packwiz bootstrapper at the `pack.toml` URL printed by `packwiz serve`, launch the instance, and confirm that:

1. The bootstrapper downloads the new mod and dependencies.
2. Minecraft reaches the main menu without dependency or loader errors.
3. A test server starts if the mod is server-side or required on both sides.

Stop the local server with `Ctrl+C` after testing. Restore the test instance's bootstrap URL to the GitHub URL before distributing it.

## Publish the update

Commit the `.pw.toml` metadata together with both Packwiz manifest files:

```powershell
git add pack.toml index.toml mods .gitignore ADDING_MODS.md
git status
git commit -m "Add <mod name>"
git push origin main
```

Only stage `.gitignore` and `ADDING_MODS.md` when those files have intentionally changed; they do not need to be included in every future mod update.

After the push, verify that this URL loads and shows the new `pack.toml` hash:

```text
https://raw.githubusercontent.com/sgtLongs/arcane-horizons-packwiz/main/pack.toml
```

Players will receive the change the next time the bootstrapper runs. It compares the local pack with the GitHub manifests, downloads the new JAR, and updates changed files.

## Update or remove mods later

Update all Packwiz-managed mods and publish the resulting metadata changes:

```powershell
packwiz update --all
packwiz refresh
```

Update one mod by its metadata name:

```powershell
packwiz update <mod-name>
packwiz refresh
```

Remove a mod through Packwiz rather than deleting only its JAR. The command opens a selector; choose the mod to remove:

```powershell
packwiz remove
packwiz refresh
```

Then review, test, commit, and push `pack.toml`, `index.toml`, and the added, changed, or deleted `.pw.toml` files as described above.

## Common mistakes

- **Copying a JAR into `mods/`:** the bootstrapper needs a `.pw.toml` download record, not a committed JAR.
- **Forgetting `packwiz refresh`:** clients will not see files that are missing from `index.toml`.
- **Pushing only the new `.pw.toml`:** `index.toml` and the hash in `pack.toml` must be pushed in the same commit.
- **Choosing a Fabric or Forge build:** this pack requires the NeoForge build for Minecraft 1.21.1.
- **Ignoring dependencies:** accept compatible dependencies added by Packwiz and test the launch before pushing.
- **Using a web page as a direct URL:** `packwiz url add` needs a stable URL that returns the JAR itself.
- **Publishing only to another branch:** the production bootstrap URL reads `main`, so changes on other branches do not reach players until merged into `main`.
