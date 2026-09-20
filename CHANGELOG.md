# Changelog

## 0.2.2

- Keep spaces intact in CC1 filenames instead of uploading them as `%20`.
- Fix the printer form reset error after adding a printer.
- Warn after uploads that existing printer files were not checked and duplicate filenames may be renamed by the printer.

## 0.2.1

- Validate printer names, IPv4 addresses, and required CC2 access codes before submitting.
- Display structured Home Assistant API errors as readable messages instead of `[object Object]`.

## 0.2.0

- Reworked the project as a HACS-installable Home Assistant custom integration.
- Added an authenticated Home Assistant sidebar panel.
- Removed the FastAPI/Uvicorn container requirement.
- Kept the v0.1 safety scope: G-code staging and upload only; no print start or remote delete.
