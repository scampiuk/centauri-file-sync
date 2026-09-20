global.HTMLElement = class {};

let Panel;
global.customElements = {
  get: () => null,
  define: (_name, value) => {
    Panel = value;
  },
};

require('../custom_components/centauri_file_sync/frontend/panel.js');

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
