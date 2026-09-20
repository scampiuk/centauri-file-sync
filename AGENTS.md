# Repository instructions

## Home Assistant UI

Before changing `custom_components/centauri_file_sync/frontend/`, read `docs/UI_GUIDELINES.md` and follow it.

- Build the interface from Home Assistant frontend patterns and theme tokens. Prefer stable native elements such as `ha-card`, `ha-button`, `ha-alert`, and `ha-icon` when they are available in a custom panel.
- Do not create a separate colour palette, button system, card style, or alert style. Use Home Assistant semantic variables so light, dark, and custom themes continue to work.
- Keep controls keyboard accessible, give icon-only actions an accessible name, show validation next to the affected workflow, and use `ha-alert` for user-visible status messages.
- Test desktop, narrow/mobile, empty, loading, success, warning, error, disabled, and long-filename states.
- This panel ships as browser-ready JavaScript without a frontend build step. Do not add a bundler or assume that arbitrary lazy-loaded Home Assistant internals are registered unless the change deliberately introduces and documents that dependency.

Use British English in user-facing text and documentation.

## Releases

Read `RELEASING.md` before preparing or publishing a release.

- Keep the versions in `manifest.json`, `const.py`, the panel badge, and `CHANGELOG.md` identical.
- Do not publish from an unvalidated commit or create release tags manually.
- Publish releases with the **Release** GitHub Actions workflow so the tag is created only after frontend, HACS, and hassfest checks pass.
