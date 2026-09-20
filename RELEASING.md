# Publishing a release

Print Orbit uses GitHub Releases so HACS can advertise normal versioned updates.

## Prepare the release

Update the version in all of these locations in the same commit:

- `custom_components/print_orbit/manifest.json`
- `custom_components/print_orbit/const.py`
- `custom_components/print_orbit/frontend/panel.js`
- `CHANGELOG.md`

Use stable semantic versions such as `0.4.1`. Push the release commit to `main` and wait for the **Validate** workflow to pass.

## Publish

1. Open **Actions → Release → Run workflow** in GitHub.
2. Select the `main` branch.
3. Enter the version without a leading `v`, for example `0.4.1`.
4. Run the workflow.

The workflow checks that every version reference matches, validates the frontend, runs HACS and hassfest, then creates the `v0.4.1` tag and corresponding GitHub Release. HACS uses that release tag as the available version.

Do not create a tag manually. The release workflow creates it only after every validation job succeeds.
