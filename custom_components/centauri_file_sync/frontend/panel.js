class CentauriFileSyncPanel extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
    this._initialised = false;
    this._state = { printers: [], files: [], jobId: null, poll: null };
  }

  set hass(value) {
    this._hass = value;
    if (!this._initialised) {
      this._initialised = true;
      this._render();
      this._bind();
      this._refreshAll();
    }
  }

  set narrow(_value) {}
  set panel(_value) {}

  disconnectedCallback() {
    if (this._state.poll) clearTimeout(this._state.poll);
  }

  _render() {
    this.innerHTML = `
      <style>
        centauri-file-sync-panel { display:block; min-height:100%; background:var(--primary-background-color); color:var(--primary-text-color); }
        .cfs-wrap { max-width:1120px; margin:0 auto; padding:24px; }
        .cfs-top { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:22px; }
        .cfs-title { font-size:1.6rem; margin:0 0 4px; font-weight:600; }
        .cfs-sub, .cfs-muted { color:var(--secondary-text-color); }
        .cfs-badge { font-size:.78rem; padding:5px 9px; border:1px solid var(--divider-color); border-radius:999px; color:var(--secondary-text-color); white-space:nowrap; }
        .cfs-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        .cfs-card { background:var(--card-background-color); border:1px solid var(--divider-color); border-radius:14px; padding:18px; min-width:0; box-shadow:var(--ha-card-box-shadow, none); }
        .cfs-wide { grid-column:1/-1; }
        .cfs-head { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:14px; }
        .cfs-head h2 { font-size:1.05rem; margin:0; }
        .cfs-row { display:grid; grid-template-columns:1.2fr 1fr .7fr auto; gap:10px; align-items:end; }
        .cfs-field label { display:block; font-size:.84rem; color:var(--secondary-text-color); margin-bottom:5px; }
        .cfs-field input, .cfs-field select, .cfs-picker { width:100%; min-height:42px; padding:8px 10px; border-radius:9px; border:1px solid var(--divider-color); background:var(--input-fill-color, var(--secondary-background-color)); color:var(--primary-text-color); font:inherit; }
        .cfs-button { min-height:40px; border:0; border-radius:9px; padding:8px 13px; cursor:pointer; background:var(--secondary-background-color); color:var(--primary-text-color); font:inherit; }
        .cfs-button.primary { background:var(--primary-color); color:var(--text-primary-color, white); }
        .cfs-button.danger { background:var(--error-color); color:white; }
        .cfs-button:disabled { opacity:.45; cursor:not-allowed; }
        .cfs-list { display:flex; flex-direction:column; gap:8px; }
        .cfs-item { display:grid; grid-template-columns:auto 1fr auto; gap:10px; align-items:center; background:var(--secondary-background-color); border:1px solid var(--divider-color); border-radius:10px; padding:10px 12px; min-width:0; }
        .cfs-item input[type=checkbox] { width:18px; height:18px; accent-color:var(--primary-color); }
        .cfs-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .cfs-meta { color:var(--secondary-text-color); font-size:.8rem; }
        .cfs-drop { border:1px dashed var(--secondary-text-color); border-radius:11px; padding:18px; text-align:center; margin-bottom:12px; }
        .cfs-drop.drag { border-color:var(--primary-color); background:color-mix(in srgb, var(--primary-color) 10%, transparent); }
        .cfs-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
        .cfs-notice { margin-top:12px; min-height:20px; font-size:.88rem; color:var(--primary-color); }
        .cfs-error { color:var(--error-color); }
        .cfs-job { display:grid; grid-template-columns:1.1fr 1.1fr 2fr auto; gap:10px; align-items:center; padding:9px 0; border-bottom:1px solid var(--divider-color); }
        .cfs-job:last-child { border-bottom:0; }
        .cfs-progress { height:9px; background:var(--secondary-background-color); border-radius:999px; overflow:hidden; }
        .cfs-bar { height:100%; width:0; background:var(--primary-color); transition:width .2s ease; }
        .cfs-ok { color:var(--success-color, #2e7d32); } .cfs-bad { color:var(--error-color); } .cfs-wait { color:var(--warning-color, #f9a825); }
        .cfs-empty { color:var(--secondary-text-color); font-size:.9rem; padding:10px 0; }
        @media (max-width:760px) {
          .cfs-grid { grid-template-columns:1fr; }
          .cfs-wide { grid-column:auto; }
          .cfs-row { grid-template-columns:1fr 1fr; }
          .cfs-full-mobile { grid-column:1/-1; }
          .cfs-job { grid-template-columns:1fr 1fr; }
          .cfs-progcell { grid-column:1/-1; }
          .cfs-top { flex-direction:column; }
          .cfs-wrap { padding:14px; }
        }
      </style>
      <div class="cfs-wrap">
        <div class="cfs-top">
          <div><h1 class="cfs-title">Centauri File Sync</h1><div class="cfs-sub">Stage G-code once, then copy it to every selected printer.</div></div>
          <span class="cfs-badge">v0.2.0 · HACS edition · upload only</span>
        </div>

        <div class="cfs-grid">
          <section class="cfs-card">
            <div class="cfs-head"><h2>1. Printers</h2><span id="cfsPrinterCount" class="cfs-muted"></span></div>
            <form id="cfsPrinterForm" class="cfs-row">
              <div class="cfs-field"><label for="cfsPrinterName">Name</label><input id="cfsPrinterName" required placeholder="Left printer"></div>
              <div class="cfs-field"><label for="cfsPrinterHost">IP address</label><input id="cfsPrinterHost" required inputmode="decimal" placeholder="192.168.1.51"></div>
              <div class="cfs-field"><label for="cfsPrinterModel">Model</label><select id="cfsPrinterModel"><option value="cc1">CC1</option><option value="cc2">CC2</option></select></div>
              <button class="cfs-button primary cfs-full-mobile" type="submit">Add</button>
              <div id="cfsAccessCodeWrap" class="cfs-field cfs-full-mobile" style="display:none"><label for="cfsAccessCode">CC2 access code</label><input id="cfsAccessCode" type="password" autocomplete="off"></div>
            </form>
            <div id="cfsPrinterNotice" class="cfs-notice"></div>
            <div id="cfsPrinterList" class="cfs-list"></div>
          </section>

          <section class="cfs-card">
            <div class="cfs-head"><h2>2. G-code files</h2><span id="cfsFileCount" class="cfs-muted"></span></div>
            <div id="cfsDrop" class="cfs-drop">
              <strong>Drop .gcode files here</strong><br><span class="cfs-muted">or choose multiple files</span><br><br>
              <input id="cfsFilePicker" class="cfs-picker" type="file" multiple accept=".gcode" style="max-width:360px">
            </div>
            <div id="cfsFileNotice" class="cfs-notice"></div>
            <div id="cfsFileList" class="cfs-list"></div>
            <div class="cfs-actions"><button id="cfsRemoveStaged" class="cfs-button danger" type="button">Remove selected from staging</button></div>
          </section>

          <section class="cfs-card cfs-wide">
            <div class="cfs-head"><div><h2>3. Copy</h2><div class="cfs-muted">Different printers upload in parallel. Each individual printer receives one file at a time.</div></div></div>
            <button id="cfsCopyButton" class="cfs-button primary" type="button">Copy selected files to selected printers</button>
            <div id="cfsCopyNotice" class="cfs-notice"></div>
            <div id="cfsJobList"></div>
          </section>
        </div>
      </div>`;
  }

  _$(id) { return this.querySelector(`#${id}`); }
  _esc(value) { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  _human(n) { return n < 1024 ? `${n} B` : n < 1048576 ? `${(n/1024).toFixed(1)} KB` : `${(n/1048576).toFixed(1)} MB`; }
  _selected(selector) { return [...this.querySelectorAll(`${selector}:checked`)].map(x => x.value); }
  _note(id, message, error=false) { const el=this._$(id); el.textContent=message || ''; el.className=`cfs-notice${error?' cfs-error':''}`; }

  async _api(method, path, body) {
    return this._hass.callApi(method, `centauri_file_sync/${path}`, body);
  }

  async _stageChunk(file, uploadId, offset, chunk) {
    const query = new URLSearchParams({
      upload_id: uploadId,
      filename: file.name,
      offset: String(offset),
      total: String(file.size),
    });
    const response = await this._hass.fetchWithAuth(`/api/centauri_file_sync/files/chunk?${query.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: chunk,
    });
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try { const payload = await response.json(); message = payload.detail || message; } catch (_err) {}
      throw new Error(message);
    }
    return response.json();
  }

  _bind() {
    this._$('cfsPrinterModel').addEventListener('change', () => {
      this._$('cfsAccessCodeWrap').style.display = this._$('cfsPrinterModel').value === 'cc2' ? 'block' : 'none';
    });

    this._$('cfsPrinterForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      this._note('cfsPrinterNotice', 'Saving…');
      const body = {
        name: this._$('cfsPrinterName').value.trim(),
        host: this._$('cfsPrinterHost').value.trim(),
        model: this._$('cfsPrinterModel').value,
        access_code: this._$('cfsAccessCode').value.trim() || null,
      };
      try {
        await this._api('POST', 'printers', body);
        event.target.reset();
        this._$('cfsAccessCodeWrap').style.display = 'none';
        this._note('cfsPrinterNotice', 'Printer added.');
        await this._refreshPrinters();
      } catch (err) { this._note('cfsPrinterNotice', err.message || String(err), true); }
    });

    this._$('cfsPrinterList').addEventListener('click', async (event) => {
      const id = event.target.dataset.removePrinter;
      if (!id) return;
      try {
        await this._api('DELETE', `printers/${encodeURIComponent(id)}`);
        await this._refreshPrinters();
      } catch (err) { this._note('cfsPrinterNotice', err.message || String(err), true); }
    });

    this._$('cfsFilePicker').addEventListener('change', (event) => this._stage(event.target.files));
    const drop = this._$('cfsDrop');
    ['dragenter','dragover'].forEach(name => drop.addEventListener(name, event => { event.preventDefault(); drop.classList.add('drag'); }));
    ['dragleave','drop'].forEach(name => drop.addEventListener(name, event => { event.preventDefault(); drop.classList.remove('drag'); }));
    drop.addEventListener('drop', event => this._stage(event.dataTransfer.files));

    this._$('cfsRemoveStaged').addEventListener('click', async () => {
      const files = this._selected('.cfsFileCheck');
      if (!files.length) { this._note('cfsFileNotice', 'Select at least one staged file.', true); return; }
      try {
        await this._api('POST', 'files/delete', { files });
        this._note('cfsFileNotice', `Removed ${files.length} staged file${files.length===1?'':'s'}.`);
        await this._refreshFiles();
      } catch (err) { this._note('cfsFileNotice', err.message || String(err), true); }
    });

    this._$('cfsCopyButton').addEventListener('click', async () => {
      const files = this._selected('.cfsFileCheck');
      const printers = this._selected('.cfsPrinterCheck');
      if (!files.length || !printers.length) { this._note('cfsCopyNotice', 'Select at least one file and one printer.', true); return; }
      this._$('cfsCopyButton').disabled = true;
      this._note('cfsCopyNotice', `Starting ${files.length * printers.length} upload${files.length * printers.length === 1 ? '' : 's'}…`);
      try {
        const result = await this._api('POST', 'copy', { files, printers });
        this._state.jobId = result.job_id;
        await this._pollJob();
      } catch (err) {
        this._$('cfsCopyButton').disabled = false;
        this._note('cfsCopyNotice', err.message || String(err), true);
      }
    });
  }

  async _refreshAll() {
    try { await Promise.all([this._refreshPrinters(), this._refreshFiles()]); }
    catch (err) { this._note('cfsCopyNotice', err.message || String(err), true); }
  }

  async _refreshPrinters() {
    this._state.printers = await this._api('GET', 'printers');
    this._$('cfsPrinterCount').textContent = `${this._state.printers.length} configured`;
    this._$('cfsPrinterList').innerHTML = this._state.printers.length ? this._state.printers.map(p => `
      <div class="cfs-item">
        <input class="cfsPrinterCheck" type="checkbox" value="${this._esc(p.id)}" checked aria-label="Select ${this._esc(p.name)}">
        <div class="cfs-name"><strong>${this._esc(p.name)}</strong><div class="cfs-meta">${this._esc(p.host)} · ${String(p.model).toUpperCase()}${p.has_access_code?' · access code saved':''}</div></div>
        <button class="cfs-button" type="button" data-remove-printer="${this._esc(p.id)}">Remove</button>
      </div>`).join('') : '<div class="cfs-empty">Add your Centauri printers above.</div>';
  }

  async _refreshFiles() {
    this._state.files = await this._api('GET', 'files');
    this._$('cfsFileCount').textContent = `${this._state.files.length} staged`;
    this._$('cfsFileList').innerHTML = this._state.files.length ? this._state.files.map(f => `
      <div class="cfs-item">
        <input class="cfsFileCheck" type="checkbox" value="${this._esc(f.name)}" checked aria-label="Select ${this._esc(f.name)}">
        <div class="cfs-name"><strong>${this._esc(f.name)}</strong><div class="cfs-meta">${this._human(f.size)}</div></div>
        <span class="cfs-meta">ready</span>
      </div>`).join('') : '<div class="cfs-empty">No files staged yet.</div>';
  }

  async _stage(fileList) {
    const files = [...fileList];
    if (!files.length) return;
    const invalid = files.find(file => !file.name.toLowerCase().endsWith('.gcode'));
    if (invalid) { this._note('cfsFileNotice', `${invalid.name}: only .gcode files are accepted.`, true); return; }

    const chunkSize = 4 * 1024 * 1024;
    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (!file.size) throw new Error(`${file.name} is empty.`);
        const uploadId = (globalThis.crypto && crypto.randomUUID)
          ? crypto.randomUUID().replace(/-/g, '')
          : `u${Date.now()}${Math.random().toString(36).slice(2)}`;
        let offset = 0;
        while (offset < file.size) {
          const end = Math.min(offset + chunkSize, file.size);
          const chunk = file.slice(offset, end);
          await this._stageChunk(file, uploadId, offset, chunk);
          offset = end;
          const pct = Math.round((offset / file.size) * 100);
          this._note('cfsFileNotice', `Staging ${index + 1}/${files.length}: ${file.name} · ${pct}%`);
        }
      }
      this._note('cfsFileNotice', `Staged ${files.length} file${files.length===1?'':'s'}.`);
      await this._refreshFiles();
    } catch (err) {
      this._note('cfsFileNotice', err.message || String(err), true);
    }
    this._$('cfsFilePicker').value = '';
  }

  async _pollJob() {
    if (!this._state.jobId) return;
    try {
      const job = await this._api('GET', `jobs/${this._state.jobId}`);
      this._renderJob(job);
      if (job.status === 'running') {
        this._state.poll = setTimeout(() => this._pollJob(), 700);
      } else {
        this._$('cfsCopyButton').disabled = false;
        this._note('cfsCopyNotice', job.status === 'complete' ? 'All selected uploads completed.' : 'Finished with one or more failures.', job.status !== 'complete');
      }
    } catch (err) {
      this._$('cfsCopyButton').disabled = false;
      this._note('cfsCopyNotice', err.message || String(err), true);
    }
  }

  _renderJob(job) {
    this._$('cfsJobList').innerHTML = job.items.map(item => {
      const pct = item.total ? Math.round((item.sent / item.total) * 100) : 0;
      const status = item.status === 'complete' ? '<span class="cfs-ok">✓ complete</span>' :
        item.status === 'failed' ? `<span class="cfs-bad" title="${this._esc(item.error || '')}">✕ failed</span>` :
        item.status === 'uploading' ? `<span class="cfs-wait">${pct}%</span>` : '<span class="cfs-muted">queued</span>';
      return `<div class="cfs-job">
        <div class="cfs-name">${this._esc(item.file)}</div>
        <div>${this._esc(item.printer_name)}</div>
        <div class="cfs-progcell"><div class="cfs-progress"><div class="cfs-bar" style="width:${pct}%"></div></div><div class="cfs-meta">${this._human(item.sent)} / ${this._human(item.total)}${item.error ? ' · ' + this._esc(item.error) : ''}</div></div>
        <div>${status}</div>
      </div>`;
    }).join('');
  }
}

if (!customElements.get('centauri-file-sync-panel')) {
  customElements.define('centauri-file-sync-panel', CentauriFileSyncPanel);
}
