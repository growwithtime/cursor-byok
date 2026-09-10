---
name: release
description: Build and validate local Cursor BYOK desktop packages without an online updater or release publication.
---

# Desktop packaging

This personal fork has no in-app updater and does not publish releases automatically. Build packages locally and distribute them manually.

## Packaging boundary

```text
cursor-byok/
├── Cargo.lock
├── Makefile
└── apps/desktop/
    ├── package.json
    ├── package-lock.json
    └── src-tauri/
        ├── Cargo.toml
        └── tauri.conf.json
```

- Keep the desktop version identical in `package.json`, `Cargo.toml`, `tauri.conf.json`, and their lockfiles.
- Do not add update endpoints, updater public keys, updater plugins, updater artifacts, or automatic release publication.
- Do not generate or require a Tauri updater signing key. Operating-system code signing is a separate optional packaging concern.
- Windows local packaging uses the NSIS bundle through `make build-desktop`.
- macOS and Linux local packaging use the Tauri targets configured in `tauri.conf.json`.

## Validation

From `apps/desktop`, run:

```bash
npm run check
npm run tauri:build -- --debug --no-bundle
```

Then inspect the package produced by `make build-desktop`. Confirm that no application runtime file contains `latest.json`, `portable-latest.json`, `tauri-plugin-updater`, or an external update endpoint.
