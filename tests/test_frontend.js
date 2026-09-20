global.HTMLElement = class {};
const fs = require('fs');
const path = require('path');

let Panel;
global.customElements = {
  get: () => null,
  define: (_name, value) => {
    Panel = value;
  },
};

require('../custom_components/centauri_file_sync/frontend/panel.js');

const panelSource = fs.readFileSync(
  path.join(__dirname, '../custom_components/centauri_file_sync/frontend/panel.js'),
  'utf8',
);

for (const requiredPattern of [
  '<ha-card',
  '<ha-button',
  "document.createElement('ha-alert')",
  'var(--primary-color)',
  '@media (max-width:600px)',
]) {
  if (!panelSource.includes(requiredPattern)) {
    throw new Error(`Missing Home Assistant UI pattern: ${requiredPattern}`);
  }
}

const panel = new Panel();
const validAddresses = [
  '192.168.1.51',
  '10.0.0.1',
  '0.0.0.0',
  '255.255.255.255',
];
const invalidAddresses = [
  '',
  '192.168.1',
  '192.168.1.256',
  '192.168.01.1',
  'printer.local',
  '1.2.3.4.5',
];

for (const address of validAddresses) {
  if (!panel._isIPv4(address)) throw new Error(`Expected valid IPv4 address: ${address}`);
}

for (const address of invalidAddresses) {
  if (panel._isIPv4(address)) throw new Error(`Expected invalid IPv4 address: ${address}`);
}

if (panel._errorMessage({ detail: 'Printer host must be an IPv4 address' }) !== 'Printer host must be an IPv4 address') {
  throw new Error('Top-level API detail was not extracted');
}

if (panel._errorMessage({ body: { detail: 'Nested detail' } }) !== 'Nested detail') {
  throw new Error('Nested API detail was not extracted');
}
