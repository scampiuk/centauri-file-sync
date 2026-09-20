"""Constants for Centauri File Sync."""

DOMAIN = "centauri_file_sync"
NAME = "Centauri File Sync"
VERSION = "0.2.2"
PANEL_TITLE = "Centauri Sync"
PANEL_ICON = "mdi:printer-3d"
PANEL_URL = DOMAIN
STATIC_URL = f"/{DOMAIN}_static"
API_BASE = f"/api/{DOMAIN}"
STORAGE_VERSION = 1
STORAGE_KEY = f"{DOMAIN}.printers"
MAX_FILES_PER_BATCH = 100
MAX_PRINTERS_PER_JOB = 32
ALLOWED_SUFFIXES = {".gcode"}
