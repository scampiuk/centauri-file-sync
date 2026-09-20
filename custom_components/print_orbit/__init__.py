"""Print Orbit integration."""
from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN
from .http import register_views
from .manager import PrintOrbitManager
from .panel import async_register_panel, async_unregister_panel

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the integration namespace."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Print Orbit from a config entry."""
    domain_data = hass.data.setdefault(DOMAIN, {})

    if "manager" not in domain_data:
        manager = PrintOrbitManager(hass)
        await manager.async_setup()
        domain_data["manager"] = manager

    if not domain_data.get("views_registered"):
        register_views(hass)
        domain_data["views_registered"] = True

    await async_register_panel(
        hass,
        register_static=not domain_data.get("static_registered", False),
    )
    domain_data["static_registered"] = True
    domain_data["entry_id"] = entry.entry_id
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload the config entry while retaining globally registered HTTP routes."""
    async_unregister_panel(hass)
    domain_data = hass.data.get(DOMAIN, {})
    domain_data.pop("manager", None)
    domain_data.pop("entry_id", None)
    return True
