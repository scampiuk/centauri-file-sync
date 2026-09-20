# Centauri File Sync for Home Assistant

A small Home Assistant custom integration for copying the same set of already-sliced `.gcode` files to multiple Elegoo Centauri printers.

This project intentionally **does not start prints** and **does not delete files from printers**. It is a file distribution tool, not a print-farm scheduler.

## Features

- Add multiple Centauri Carbon printers by IP address.
- Stage many `.gcode` files in Home Assistant, including files larger than Home Assistant Core's 16 MiB per-request limit (browser staging is chunked).
- Select any combination of files and printers.
- Copy each selected file to every selected printer.
- Upload to different printers in parallel while sending files sequentially to each individual printer.
- Per-file/per-printer progress and error reporting.
- Original Centauri Carbon (CC1) support; CC2 support is included via access code but is not the primary test target yet.
- HTTP-only printer uploads: the integration does not consume a CC1 SDCP/WebSocket connection slot.
- Home Assistant sidebar panel using the current HA theme.

## Interface conventions

The panel follows Home Assistant's frontend component and theme conventions. UI contributors should read [docs/UI_GUIDELINES.md](docs/UI_GUIDELINES.md) before changing the panel; automated coding agents must also follow the repository instructions in [AGENTS.md](AGENTS.md).

## HACS installation

This repository is structured as a HACS **Integration** repository.

Until it is submitted to the default HACS catalogue, install it as a custom repository:

1. In Home Assistant, open **HACS**.
2. Open the three-dot menu and choose **Custom repositories**.
3. Add `https://github.com/scampiuk/centauri-file-sync`.
4. Choose category **Integration**.
5. Install **Centauri File Sync**.
6. Restart Home Assistant.
7. Go to **Settings → Devices & services → Add integration**.
8. Search for **Centauri File Sync** and add it.
9. Open **Centauri Sync** from the Home Assistant sidebar.

## Manual installation

Copy `custom_components/centauri_file_sync` to:

```text
/config/custom_components/centauri_file_sync
```

Restart Home Assistant, then add **Centauri File Sync** from **Settings → Devices & services**.

## Where staged files live

Staged G-code files are stored locally under:

```text
/config/centauri_file_sync/files/
```

Printer configuration is stored using Home Assistant's normal integration storage.

Uploads use the printers' HTTP file-transfer endpoints directly; no printer control connection is opened.

## Duplicate filenames

Version 0.3 does not open the printer control connection to list remote files before uploading. If a filename already exists, the printer may keep both files by renaming the new upload. The completion screen explicitly warns when this has not been checked. Remote duplicate detection is planned separately from the HTTP-only uploader.

## Safety scope

Version 0.3 deliberately exposes no print-start action and no remote delete action. File distribution is the only printer-changing operation.
