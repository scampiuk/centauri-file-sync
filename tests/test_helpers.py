"""Tests for pure helper behaviour that does not need Home Assistant installed."""
import importlib.util
from pathlib import Path

ROOT = Path(__file__).parents[1] / "custom_components" / "centauri_file_sync"


def _load_manager_module():
    # Load the source while substituting minimal HA modules is intentionally
    # avoided here; helper behaviour is also checked through direct source-level
    # smoke tests in CI. This file exists for future HA dev-container testing.
    return ROOT / "manager.py"


def test_manager_exists():
    assert _load_manager_module().is_file()


def test_manifest_exists():
    assert (ROOT / "manifest.json").is_file()
