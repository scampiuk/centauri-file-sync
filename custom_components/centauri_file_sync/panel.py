"""Sidebar panel registration for Centauri File Sync."""
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PANEL_ICON, PANEL_TITLE, PANEL_URL, STATIC_URL, VERSION


async def async_register_panel(hass: HomeAssistant, *, register_static: bool = True) -> None:
    """Serve and register the Centauri File Sync panel."""
    if register_static:
        frontend_dir = Path(__file__).parent / "frontend"
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(frontend_dir), False)]
        )

    if frontend.async_panel_exists(hass, PANEL_URL):
        return

    await panel_custom.async_register_panel(
        hass,
        webcomponent_name="centauri-file-sync-panel",
        frontend_url_path=PANEL_URL,
        module_url=f"{STATIC_URL}/panel.js?v={VERSION}",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=True,
        config={},
        config_panel_domain=DOMAIN,
    )


def async_unregister_panel(hass: HomeAssistant) -> None:
    """Remove the sidebar panel."""
    if frontend.async_panel_exists(hass, PANEL_URL):
        frontend.async_remove_panel(hass, PANEL_URL)
