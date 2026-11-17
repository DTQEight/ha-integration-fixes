/* 60S SIGNAL — 科技风资讯聚合卡片（无外部依赖） */
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (m) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]
));

const CSS = `
:host {
  display: block;
  --bg: #05070d;
  --panel: rgba(10, 18, 30, .72);
  --line: rgba(96, 190, 255, .16);
  --txt: #dbeafe;
  --mut: #7c93ae;
  --mono: "SFMono-Regular", "JetBrains Mono", Consolas, "Liberation Mono", monospace;
}
* { box-sizing: border-box; }
.shell {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  padding: 22px;
  color: var(--txt);
  background:
    radial-gradient(1100px 520px at 8% -12%, rgba(34, 211, 238, .12), transparent 62%),
    radial-gradient(900px 480px at 102% -6%, rgba(99, 102, 241, .13), transparent 58%),
    var(--bg);
  border: 1px solid rgba(120, 200, 255, .10);
  box-shadow: 0 26px 70px -40px rgba(34, 211, 238, .45);
  font-family: "PingFang SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif;
}
.shell::before {
  content: "";
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(120, 200, 255, .05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120, 200, 255, .05) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: radial-gradient(circle at 50% 0%, #000 20%, transparent 78%);
  pointer-events: none;
}
.shell::after {
  content: "";
  position: absolute; left: 0; right: 0; top: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--acc, #22d3ee), transparent);
  opacity: .8;
  animation: scan 5.5s linear infinite;
}
@keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
header {
  position: relative; z-index: 1;
  display: flex; flex-wrap: wrap; gap: 16px;
  align-items: flex-end; justify-content: space-between;
  padding-bottom: 16px; border-bottom: 1px solid var(--line);
}
.brand { display: flex; align-items: center; gap: 14px; }
.logo {
  width: 46px; height: 46px; border-radius: 14px;
  display: grid; place-items: center;
  font-family: var(--mono); font-weight: 700; font-size: 17px; letter-spacing: -1px;
  color: #041018;
  background: linear-gradient(135deg, #7dd3fc, #22d3ee 55%, #0ea5e9);
  box-shadow: 0 0 0 1px rgba(125, 211, 252, .45), 0 12px 30px -14px rgba(34, 211, 238, .9);
}
h1 {
  margin: 0; font-size: 19px; font-weight: 700; letter-spacing: .22em;
  font-family: var(--mono);
}
h1 span { color: #22d3ee; }
.sub { margin: 4px 0 0; font-size: 11px; color: var(--mut); letter-spacing: .08em; }
.sub b { color: #bae6fd; font-family: var(--mono); font-weight: 600; }
.meta { display: flex; align-items: center; gap: 22px; }
.stat { display: flex; flex-direction: column; gap: 2px; }
.stat b { font-family: var(--mono); font-size: 17px; line-height: 1; color: #e0f2fe; }
.stat span { font-size: 9px; letter-spacing: .18em; color: var(--mut); }
.live {
  display: flex; align-items: center; gap: 7px;
  font-family: var(--mono); font-size: 11px; letter-spacing: .16em; color: #34d399;
  padding: 6px 11px; border-radius: 999px;
  border: 1px solid rgba(52, 211, 153, .3); background: rgba(52, 211, 153, .07);
}
.live i {
  width: 7px; height: 7px; border-radius: 50%; background: #34d399;
  box-shadow: 0 0 0 0 rgba(52, 211, 153, .6);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  70% { box-shadow: 0 0 0 8px rgba(52, 211, 153, 0); }
  100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
}
nav {
  position: relative; z-index: 1;
  display: flex; gap: 8px; overflow-x: auto; padding: 16px 0 6px;
  scrollbar-width: none;
}
nav::-webkit-scrollbar { display: none; }
.tab {
  flex: 0 0 auto; display: flex; align-items: center; gap: 8px;
  padding: 9px 14px; border-radius: 12px; cursor: pointer;
  color: #a9c1d8; background: rgba(15, 27, 43, .6);
  border: 1px solid rgba(120, 200, 255, .12);
  font-size: 13px; transition: .18s ease;
}
.tab ha-icon { --mdc-icon-size: 16px; }
.tab .n { font-family: var(--mono); font-size: 10px; color: var(--mut); }
.tab:hover { color: #e0f2fe; border-color: rgba(120, 200, 255, .34); transform: translateY(-1px); }
.tab.on {
  color: #041018; background: linear-gradient(135deg, var(--acc), #7dd3fc);
  border-color: transparent; box-shadow: 0 12px 26px -14px var(--acc);
}
.tab.on .n { color: rgba(4, 16, 24, .68); }
main { position: relative; z-index: 1; padding-top: 14px; }
.grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
section-card {
  position: relative; display: block; overflow: hidden;
  border-radius: 16px; padding: 16px 16px 12px;
  background: linear-gradient(158deg, rgba(18, 32, 50, .82), rgba(8, 14, 24, .78));
  border: 1px solid rgba(120, 200, 255, .14);
  transition: .2s ease;
}
section-card::before, section-card::after {
  content: ""; position: absolute; width: 14px; height: 14px;
  border-color: var(--acc); border-style: solid; opacity: .55;
}
section-card::before { top: 8px; left: 8px; border-width: 1px 0 0 1px; }
section-card::after { bottom: 8px; right: 8px; border-width: 0 1px 1px 0; }
section-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--acc) 45%, transparent);
  box-shadow: 0 22px 44px -30px var(--acc);
}
.sc-head { display: flex; align-items: center; gap: 9px; margin-bottom: 10px; }
.sc-head i {
  width: 3px; height: 15px; border-radius: 2px; background: var(--acc);
  box-shadow: 0 0 12px var(--acc);
}
.sc-head h3 { margin: 0; font-size: 13.5px; font-weight: 600; letter-spacing: .04em; }
.sc-head em {
  margin-left: auto; font-style: normal; font-family: var(--mono);
  font-size: 10px; color: var(--mut); padding: 2px 7px;
  border: 1px solid rgba(120, 200, 255, .16); border-radius: 999px;
}
ol { list-style: none; margin: 0; padding: 0; }
li {
  display: grid; grid-template-columns: 22px 1fr auto; gap: 9px;
  align-items: baseline; padding: 7px 0;
  border-top: 1px dashed rgba(120, 200, 255, .09);
  font-size: 13px; line-height: 1.5;
}
li:first-child { border-top: 0; }
li .idx {
  font-family: var(--mono); font-size: 10.5px; color: var(--acc);
  opacity: .85; text-align: right;
}
li a, li .t { color: #d7e7f7; text-decoration: none; }
li a:hover { color: var(--acc); text-decoration: underline; text-underline-offset: 3px; }
li .x {
  font-family: var(--mono); font-size: 10px; color: var(--mut);
  white-space: nowrap; max-width: 110px; overflow: hidden; text-overflow: ellipsis;
}
li .qr { margin-top: 6px; }
li .qr img {
  width: 112px; height: 112px; object-fit: contain;
  background: #fff; padding: 6px; border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(120, 200, 255, .35), 0 14px 30px -18px #22d3ee;
}
.err {
  margin-top: 8px; padding: 8px 10px; border-radius: 10px;
  border: 1px dashed rgba(251, 146, 60, .4); background: rgba(251, 146, 60, .06);
  font-family: var(--mono); font-size: 10.5px; letter-spacing: .06em; color: #fdba74;
}
.tiles { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); }
.tile {
  position: relative; overflow: hidden; cursor: pointer;
  padding: 16px; border-radius: 16px; text-align: left;
  background: linear-gradient(150deg, rgba(18, 32, 50, .82), rgba(8, 14, 24, .72));
  border: 1px solid rgba(120, 200, 255, .13); transition: .2s ease;
}
.tile:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--acc) 50%, transparent); }
.tile .code {
  font-family: var(--mono); font-size: 10px; letter-spacing: .2em; color: var(--acc);
}
.tile h3 { margin: 8px 0 10px; font-size: 17px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.tile h3 ha-icon { --mdc-icon-size: 19px; color: var(--acc); }
.tile .row { display: flex; gap: 14px; font-family: var(--mono); font-size: 10.5px; color: var(--mut); }
.tile .row b { color: #cfe6f8; font-weight: 600; }
.tile .go {
  margin-top: 12px; font-family: var(--mono); font-size: 10px; letter-spacing: .16em; color: var(--acc);
  opacity: .85;
}
.tile::after {
  content: ""; position: absolute; right: -30px; top: -30px; width: 90px; height: 90px;
  border-radius: 50%; background: var(--acc); opacity: .12; filter: blur(18px);
}
.empty {
  padding: 46px 0; text-align: center;
  font-family: var(--mono); font-size: 11px; letter-spacing: .2em; color: var(--mut);
}
footer {
  position: relative; z-index: 1;
  margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--line);
  display: flex; flex-wrap: wrap; gap: 8px 18px;
  font-family: var(--mono); font-size: 10px; letter-spacing: .12em; color: var(--mut);
}
footer b { color: #8fd3f4; font-weight: 500; }
@media (max-width: 640px) {
  .shell { padding: 16px; border-radius: 18px; }
  .meta { gap: 14px; width: 100%; justify-content: space-between; }
  .grid { grid-template-columns: 1fr; }
  h1 { font-size: 16px; }
}
`;

class SixtyHub extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._active = 'overview';
    this._sig = '';
  }

  setConfig(config) {
    if (!config || !Array.isArray(config.channels) || !config.channels.length) {
      throw new Error('需要配置 channels 列表');
    }
    this.config = { title: '60S SIGNAL', subtitle: '多源资讯聚合终端', ...config };
  }

  getCardSize() {
    return 12;
  }

  set hass(hass) {
    this._hass = hass;
    this._maybeRender();
  }

  _channels() {
    const hass = this._hass;
    if (!hass) return [];
    return this.config.channels.map((c, i) => {
      const st = hass.states[c.entity];
      const secs = (st && st.attributes && st.attributes.sections) || [];
      const items = secs.reduce((sum, s) => sum + ((s.items && s.items.length) || 0), 0);
      return { ...c, idx: i, st, secs, items, acc: c.accent || '#22d3ee' };
    });
  }

  _maybeRender() {
    if (!this._hass || !this.config) return;
    const sig = this._active + '|' + this.config.channels.map((c) => {
      const s = this._hass.states[c.entity];
      return s ? s.last_updated : 'x';
    }).join(',');
    if (sig === this._sig) return;
    this._sig = sig;
    this._render();
  }

  _render() {
    const chans = this._channels();
    if (!this.shadowRoot.querySelector('.shell')) {
      this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="shell"></div>`;
    }
    const shell = this.shadowRoot.querySelector('.shell');
    const active = this._active;
    const acc = active === 'overview'
      ? '#22d3ee'
      : (chans.find((c) => c.key === active) || {}).acc || '#22d3ee';
    shell.style.setProperty('--acc', acc);
    const totalSections = chans.reduce((a, c) => a + c.secs.length, 0);
    const totalItems = chans.reduce((a, c) => a + c.items, 0);
    const updated = (chans.find((c) => c.st && c.st.state) || {}).st;
    const stamp = updated && updated.state && updated.state !== 'unknown'
      ? esc(updated.state) : '--:--';

    shell.innerHTML = `
      <header>
        <div class="brand">
          <div class="logo">60</div>
          <div>
            <h1>${esc(this.config.title).replace('SIGNAL', '<span>SIGNAL</span>')}</h1>
            <p class="sub">${esc(this.config.subtitle)} · <b>LOCAL:4399</b></p>
          </div>
        </div>
        <div class="meta">
          <div class="stat"><b>${chans.length}</b><span>CHANNELS</span></div>
          <div class="stat"><b>${totalSections}</b><span>SOURCES</span></div>
          <div class="stat"><b>${totalItems}</b><span>FEEDS</span></div>
          <div class="stat"><b>${stamp}</b><span>UPDATED</span></div>
          <div class="live"><i></i>LIVE</div>
        </div>
      </header>
      <nav>${this._tabs(chans)}</nav>
      <main>${active === 'overview' ? this._overview(chans) : this._channel(chans)}</main>
      <footer>
        <span>DATA <b>60s.viki.moe</b></span>
        <span>NODE <b>192.168.31.52:4399</b></span>
        <span>CACHE <b>10–360 MIN</b></span>
        <span>RENDER <b>LOCAL</b></span>
      </footer>`;
  }

  _tabs(chans) {
    const btn = (key, label, code, acc, icon) => `
      <button class="tab ${this._active === key ? 'on' : ''}" data-go="${key}" style="--acc:${acc}">
        ${icon ? `<ha-icon icon="${esc(icon)}"></ha-icon>` : ''}${esc(label)}
        ${code ? `<span class="n">${esc(code)}</span>` : ''}
      </button>`;
    return btn('overview', '总览', 'ALL', '#22d3ee', 'mdi:view-dashboard-outline')
      + chans.map((c) => btn(c.key || c.entity, c.name || c.entity, c.code || '', c.acc, c.icon)).join('');
  }

  _overview(chans) {
    if (!chans.length) return '<div class="empty">NO SIGNAL</div>';
    return `<div class="tiles">${chans.map((c) => `
      <div class="tile" data-go="${esc(c.key || c.entity)}" style="--acc:${c.acc}">
        <div class="code">${esc(c.code || 'CH')}</div>
        <h3><ha-icon icon="${esc(c.icon || 'mdi:rss')}"></ha-icon>${esc(c.name)}</h3>
        <div class="row"><span>板块 <b>${c.secs.length}</b></span><span>条目 <b>${c.items}</b></span></div>
        <div class="go">ENTER CHANNEL →</div>
      </div>`).join('')}</div>`;
  }

  _channel(chans) {
    const ch = chans.find((c) => (c.key || c.entity) === this._active);
    if (!ch) return '<div class="empty">NO SIGNAL</div>';
    if (!ch.secs.length) return '<div class="empty">WAITING FOR DATA …</div>';
    return `<div class="grid">${ch.secs.map((sec) => this._section(sec, ch)).join('')}</div>`;
  }

  _section(sec, ch) {
    const items = (sec.items || []).map((it, i) => {
      const idx = String(i + 1).padStart(2, '0');
      let t = esc(it.t || '');
      if (it.l) t = `<a href="${esc(it.l)}" target="_blank" rel="noreferrer">${t}</a>`;
      const qr = it.img ? `<div class="qr"><img src="${esc(it.img)}" alt="qr"></div>` : '';
      const x = it.x ? `<span class="x">${esc(it.x)}</span>` : '<span></span>';
      return `<li><span class="idx">${idx}</span><span>${t}${qr}</span>${x}</li>`;
    }).join('');
    const err = sec.err ? `<div class="err">LINK DOWN · ${esc(String(sec.err).toUpperCase())}</div>` : '';
    const body = items || '<div class="err">EMPTY PAYLOAD</div>';
    return `<section-card style="--acc:${ch.acc}">
      <div class="sc-head"><i></i><h3>${esc(sec.n || sec.k || '')}</h3><em>${(sec.items || []).length}</em></div>
      <ol>${body}</ol>${err}
    </section-card>`;
  }

  connectedCallback() {
    this.shadowRoot.addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-go]');
      if (!el) return;
      this._active = el.dataset.go;
      this._sig = '';
      this._render();
      this.shadowRoot.querySelector('nav').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
}

customElements.define('sixty-hub', SixtyHub);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'sixty-hub',
  name: '60S Signal Hub',
  description: '60 秒资讯聚合终端（科技风）',
});
