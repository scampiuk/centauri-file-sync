# Home Assistant UI guidelines

Centauri File Sync should look and behave like part of Home Assistant, not like an unrelated web application embedded inside it.

The current reference implementation is the official [Home Assistant frontend](https://github.com/home-assistant/frontend). In particular, use its [shared components](https://github.com/home-assistant/frontend/tree/dev/src/components) and current component contracts as the source of truth.

## Component policy

- Use `ha-card` for contained surfaces.
- Use `ha-button` for actions. Primary actions use `appearance="filled"`; low-emphasis actions use `appearance="plain"` or `appearance="outlined"`; destructive actions use `variant="danger"`.
- Use `ha-alert` with `info`, `success`, `warning`, or `error` for status and validation messages. Do not render API objects directly.
- Use `ha-icon` and Material Design Icons already supported by Home Assistant. Icons support labels; they do not replace them for unfamiliar actions.
- Native form elements are acceptable where a custom panel cannot reliably guarantee that a newer, lazy-loaded HA form component is registered. Style those elements entirely with HA theme tokens and preserve native validation and keyboard behaviour.

## Visual system

- Use Home Assistant spacing variables (`--ha-space-*`) with fallbacks based on a 4 px/8 px rhythm.
- Use Home Assistant typography, border-radius, surface, border, text, and semantic colour variables. Do not hard-code light-theme colours.
- Use one clear primary action per workflow stage. Destructive actions must not compete visually with the primary action.
- Prefer dividers and whitespace to repeated grey boxes. Use pills only for compact metadata or status.
- Keep card content widths fluid, switch multi-column layouts to one column on narrow screens, and prevent filenames and device names from expanding the layout.

## Interaction and accessibility

- Every form control must have a visible label.
- Every interactive control must be keyboard reachable and have a clear focus state.
- Dynamic status messages must use `ha-alert`, which exposes an alert role to assistive technology.
- Disable actions that cannot yet succeed, and show loading state while a request is in flight.
- Validate locally where practical, then display readable server errors if the backend rejects a request.
- Check empty, populated, loading, success, warning, error, and partial-failure states.

## Review checklist

Before merging a UI change:

1. Check it in Home Assistant light and dark themes.
2. Check desktop and phone-width layouts.
3. Navigate all controls with the keyboard.
4. Test long printer names and filenames.
5. Confirm errors and progress remain understandable without relying on colour alone.
6. Run `node --check custom_components/centauri_file_sync/frontend/panel.js` and `node tests/test_frontend.js`.
