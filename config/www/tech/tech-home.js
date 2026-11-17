/* tech-home: 科技感家居总览卡片（纯原生，无外部依赖）
 * 用法：type: custom:tech-home
 * 可选：height: 720
 */

const ROOMS = [
  {
    name: "客厅", icon: "mdi:sofa", climate: "climate.210006722454675_climate",
    extras: [{ entity: "switch.chuang_wei_dian_shi", icon: "mdi:television", name: "电视" }],
  },
  { name: "书房", icon: "mdi:desk", climate: "climate.208907210826263_climate", extras: [] },
  { name: "次卧", icon: "mdi:bed", climate: "climate.211106234581522_climate", extras: [] },
  {
    name: "厨房", icon: "mdi:stove", climate: null,
    extras: [{ entity: "fan.211106238582802_fan", icon: "mdi:fan", name: "风扇" }],
  },
];

const STATS = [
  { entity: "sensor.csgaccount_0306130240952594_0306130240952594_this_month_total_usage", label: "本月用电", unit: "kWh", icon: "mdi:lightning-bolt", path: "/csg-power" },
  { entity: "sensor.csgaccount_0306130240952594_0306130240952594_this_year_total_cost", label: "本年电费", unit: "¥", icon: "mdi:currency-cny", path: "/csg-power" },
  { entity: "sensor.csgaccount_0306130240952594_0306130240952594_balance", label: "账户余额", unit: "¥", icon: "mdi:wallet", path: "/csg-power" },
  { entity: "sensor.csgaccount_0306130240952594_0306130240952594_yesterday_kwh", label: "昨日用电", unit: "kWh", icon: "mdi:chart-bar", path: "/csg-power" },
];

const WATER = [
  { entity: "sensor.210006722454684_out_tds", label: "纯水 TDS", unit: "ppm", min: 0, max: 300, good: 60, icon: "mdi:water-check" },
  { entity: "sensor.210006722454684_life1", label: "PCB 滤芯", unit: "%", min: 0, max: 100, good: 40, icon: "mdi:filter" },
  { entity: "sensor.210006722454684_life2", label: "RO 滤芯", unit: "%", min: 0, max: 100, good: 40, icon: "mdi:filter-variant" },
  { entity: "sensor.210006722454684_life3", label: "第三级滤芯", unit: "%", min: 0, max: 100, good: 40, icon: "mdi:filter-outline" },
];

const NAV = [
  { label: "3D 户型", icon: "mdi:home-city", path: "/home-dash/plan" },
  { label: "简报", icon: "mdi:newspaper-variant-outline", path: "/home-dash/brief" },
  { label: "60s", icon: "mdi:newspaper-variant", path: "/sixty" },
  { label: "地图", icon: "mdi:map", path: "/map" },
];

const MI = [
  { name: "客厅空调", entity: "climate.xiaomi_cn_270045878_ma1", icon: "mdi:air-conditioner", kind: "climate" },
  { name: "吸顶灯", entity: "light.lemesh_cn_2079863674_wy0d02_s_2_light", icon: "mdi:ceiling-light", kind: "light" },
  { name: "电脑", entity: "switch.chuangmi_cn_472610161_212a01_on_p_2_1", icon: "mdi:desktop-tower-monitor", kind: "switch" },
  { name: "小风扇", entity: "switch.cuco_cn_697088193_v3_on_p_2_1", icon: "mdi:fan", kind: "switch" },
  { name: "NAS 插座", entity: "switch.cuco_cn_846002010_v3_on_p_2_1", icon: "mdi:power-socket-cn", kind: "switch" },
  { name: "摄像机", entity: "switch.chuangmi_cn_1184756078_81ac1_on_p_2_1", icon: "mdi:cctv", kind: "switch" },
  { name: "主卧风扇", entity: "fan.jipin_cn_747620199_f004_s_2_fan", icon: "mdi:fan", kind: "fan" },
  { name: "小爱音箱", entity: "media_player.xiaomi_cn_500587584_lx06", icon: "mdi:speaker-wireless", kind: "media_player" },
  { name: "热水器", entity: "water_heater.macro_cn_x_14586_647599939_111110001000591788_jsq01_s_2_water_heater", icon: "mdi:water-boiler", kind: "water_heater" },
  { name: "智能插排", entity: "switch.qmi_cn_235100463_psv1_on_p_2_1", icon: "mdi:power-strip", kind: "switch" },
  { name: "玄关灯", entity: "switch.zimi_cn_1058009483_dhkg01_on_p_2_1", icon: "mdi:light-switch", kind: "switch" },
];

const CSS = `
  :host { display: block; }
  * { box-sizing: border-box; }
  .wrap {
    --bg: #050a14;
    --panel: rgba(13, 22, 38, .72);
    --line: rgba(56, 189, 248, .18);
    --cyan: #22d3ee;
    --cyan-dim: #0e7490;
    --amber: #fbbf24;
    --red: #f87171;
    --green: #34d399;
    --text: #dbeafe;
    --muted: #64809f;
    position: relative; overflow: hidden;
    padding: 18px; border-radius: 18px;
    font-family: "SF Mono", "JetBrains Mono", Consolas, "Roboto Mono", monospace;
    color: var(--text);
    background:
      radial-gradient(1200px 600px at 12% -10%, rgba(34, 211, 238, .13), transparent 60%),
      radial-gradient(900px 500px at 95% 0%, rgba(59, 130, 246, .12), transparent 55%),
      linear-gradient(180deg, #050a14 0%, #060d1a 55%, #04080f 100%);
    border: 1px solid var(--line);
    box-shadow: inset 0 0 80px rgba(8, 145, 178, .07), 0 12px 40px rgba(0, 0, 0, .5);
  }
  .wrap::before {
    content: ""; position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(56, 189, 248, .045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(56, 189, 248, .045) 1px, transparent 1px);
    background-size: 44px 44px;
    mask-image: radial-gradient(circle at 50% 0%, #000 40%, transparent 85%);
  }
  .wrap::after {
    content: ""; position: absolute; left: 0; right: 0; top: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(34, 211, 238, .8), transparent);
    animation: scan 5.5s linear infinite;
  }
  @keyframes scan { 0% { transform: translateY(0); opacity: .9 } 100% { transform: translateY(680px); opacity: 0 } }
  @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .35 } }
  @keyframes spin { to { transform: rotate(360deg) } }

  header { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .logo {
    width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center;
    border: 1px solid rgba(34, 211, 238, .55);
    background: linear-gradient(145deg, rgba(34, 211, 238, .22), rgba(34, 211, 238, .02));
    box-shadow: 0 0 18px rgba(34, 211, 238, .35), inset 0 0 12px rgba(34, 211, 238, .25);
    color: var(--cyan); --mdc-icon-size: 22px;
  }
  .title { font-size: 15px; letter-spacing: .34em; color: #e0f2fe; }
  .sub { margin-top: 4px; font-size: 10px; letter-spacing: .22em; color: var(--muted); }
  .clock { text-align: right; }
  .clock b { font-size: 30px; font-weight: 600; letter-spacing: .08em; color: #f0f9ff; text-shadow: 0 0 18px rgba(34, 211, 238, .45); }
  .clock span { display: block; font-size: 10px; letter-spacing: .2em; color: var(--muted); margin-top: 2px; }
  .live {
    display: inline-flex; align-items: center; gap: 7px; padding: 5px 11px;
    border: 1px solid rgba(52, 211, 153, .35); border-radius: 999px;
    font-size: 10px; letter-spacing: .2em; color: var(--green);
    background: rgba(52, 211, 153, .08);
  }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); animation: pulse 2s infinite; }

  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
  .stat {
    position: relative; padding: 12px 14px; border-radius: 12px; cursor: pointer;
    background: var(--panel); border: 1px solid var(--line);
    transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
  }
  .stat:hover { transform: translateY(-2px); border-color: rgba(34, 211, 238, .5); box-shadow: 0 8px 24px rgba(8, 145, 178, .18); }
  .stat .row { display: flex; align-items: center; gap: 7px; color: var(--muted); font-size: 10px; letter-spacing: .16em; --mdc-icon-size: 14px; }
  .stat .val { margin-top: 7px; font-size: 24px; font-weight: 600; color: #f0f9ff; letter-spacing: .02em; }
  .stat .val i { font-style: normal; font-size: 11px; color: var(--muted); margin-left: 4px; letter-spacing: .1em; }

  .sect { margin-top: 18px; display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 10px; letter-spacing: .24em; }
  .sect::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, var(--line), transparent); }

  .rooms { margin-top: 10px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .room {
    position: relative; padding: 14px; border-radius: 14px; cursor: pointer;
    background: linear-gradient(160deg, rgba(17, 30, 51, .85), rgba(8, 15, 27, .72));
    border: 1px solid var(--line); overflow: hidden;
    transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
  }
  .room::before {
    content: ""; position: absolute; left: 0; top: 14px; bottom: 14px; width: 2px;
    background: var(--cyan-dim); box-shadow: 0 0 10px var(--cyan-dim);
  }
  .room.on::before { background: var(--cyan); box-shadow: 0 0 14px var(--cyan); }
  .room:hover { transform: translateY(-2px); border-color: rgba(34, 211, 238, .45); box-shadow: 0 10px 28px rgba(8, 145, 178, .16); }
  .room .head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .room .nm { display: flex; align-items: center; gap: 8px; font-size: 12px; letter-spacing: .2em; color: #e0f2fe; --mdc-icon-size: 17px; }
  .room .nm ha-icon { color: var(--cyan); }
  .badge { font-size: 9px; letter-spacing: .16em; padding: 3px 8px; border-radius: 999px; border: 1px solid rgba(100, 128, 159, .4); color: var(--muted); }
  .room.on .badge { color: var(--cyan); border-color: rgba(34, 211, 238, .5); background: rgba(34, 211, 238, .08); }
  .temp { margin-top: 12px; display: flex; align-items: flex-end; gap: 8px; }
  .temp b { font-size: 30px; font-weight: 600; color: #f8fafc; line-height: 1; }
  .temp b i { font-style: normal; font-size: 14px; color: var(--muted); }
  .temp small { color: var(--muted); font-size: 10px; letter-spacing: .12em; margin-bottom: 3px; }
  .extras { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  .chip {
    display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 8px;
    font-size: 10px; letter-spacing: .1em; color: var(--muted); cursor: pointer;
    background: rgba(255, 255, 255, .03); border: 1px solid rgba(100, 128, 159, .25);
    --mdc-icon-size: 14px; transition: all .16s ease;
  }
  .chip.on { color: var(--amber); border-color: rgba(251, 191, 36, .45); background: rgba(251, 191, 36, .08); }
  .chip:hover { border-color: rgba(34, 211, 238, .45); color: #e0f2fe; }

  .mi { margin-top: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .mi-tile {
    position: relative; display: flex; align-items: center; gap: 10px; padding: 11px 12px;
    border-radius: 12px; cursor: pointer; background: var(--panel);
    border: 1px solid var(--line); overflow: hidden;
    transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
  }
  .mi-tile:hover { transform: translateY(-2px); border-color: rgba(34, 211, 238, .45); box-shadow: 0 8px 22px rgba(8, 145, 178, .16); }
  .mi-tile .ico {
    width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; flex: 0 0 auto;
    color: var(--muted); background: rgba(148, 163, 184, .07); border: 1px solid rgba(100, 128, 159, .22);
    --mdc-icon-size: 19px; transition: all .2s ease;
  }
  .mi-tile.on .ico {
    color: var(--cyan); background: rgba(34, 211, 238, .14); border-color: rgba(34, 211, 238, .5);
    box-shadow: 0 0 16px rgba(34, 211, 238, .3), inset 0 0 10px rgba(34, 211, 238, .2);
  }
  .mi-tile .info { min-width: 0; flex: 1; }
  .mi-tile .nm { font-size: 11px; letter-spacing: .1em; color: #dbeafe; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mi-tile .st { margin-top: 3px; font-size: 9px; letter-spacing: .14em; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mi-tile.on .st { color: var(--cyan); }
  .mi-tile .pwr { width: 6px; height: 6px; border-radius: 50%; background: #334155; flex: 0 0 auto; }
  .mi-tile.on .pwr { background: var(--cyan); box-shadow: 0 0 8px var(--cyan); }
  .mi-tile.on { border-color: rgba(34, 211, 238, .38); background: linear-gradient(150deg, rgba(34, 211, 238, .1), rgba(13, 22, 38, .72)); }

  .water { margin-top: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .ring { padding: 12px 8px; border-radius: 14px; text-align: center; background: var(--panel); border: 1px solid var(--line); cursor: pointer; transition: border-color .18s ease, transform .18s ease; }
  .ring:hover { transform: translateY(-2px); border-color: rgba(34, 211, 238, .45); }
  .ring svg { width: 78px; height: 78px; transform: rotate(-90deg); }
  .ring .track { fill: none; stroke: rgba(56, 189, 248, .13); stroke-width: 7; }
  .ring .bar { fill: none; stroke: var(--cyan); stroke-width: 7; stroke-linecap: round; filter: drop-shadow(0 0 5px rgba(34, 211, 238, .65)); transition: stroke-dashoffset .5s ease, stroke .3s ease; }
  .ring.warn .bar { stroke: var(--amber); filter: drop-shadow(0 0 5px rgba(251, 191, 36, .6)); }
  .ring.bad .bar { stroke: var(--red); filter: drop-shadow(0 0 5px rgba(248, 113, 113, .6)); }
  .ring .num { position: relative; margin-top: -54px; font-size: 17px; font-weight: 600; color: #f8fafc; }
  .ring .num i { font-style: normal; font-size: 9px; color: var(--muted); margin-left: 2px; }
  .ring .lbl { margin-top: 22px; font-size: 10px; letter-spacing: .16em; color: var(--muted); }

  footer { margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; }
  .nav {
    display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border-radius: 9px;
    font-size: 11px; letter-spacing: .12em; color: #bae6fd; cursor: pointer;
    border: 1px solid rgba(34, 211, 238, .28); background: rgba(34, 211, 238, .06);
    --mdc-icon-size: 15px; transition: all .16s ease;
  }
  .nav:hover { background: rgba(34, 211, 238, .14); border-color: rgba(34, 211, 238, .6); box-shadow: 0 0 18px rgba(34, 211, 238, .25); }

  @media (max-width: 1100px) { .mi { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 760px) {
    .stats { grid-template-columns: repeat(2, 1fr); }
    .rooms { grid-template-columns: 1fr; }
    .mi { grid-template-columns: repeat(2, 1fr); }
    .water { grid-template-columns: repeat(2, 1fr); }
    .clock b { font-size: 24px; }
  }
`;

class TechHomeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._built = false;
    this._refs = {};
    this._timer = null;
  }

  setConfig(config) {
    this._config = config || {};
    if (this._built) this._build();
  }

  connectedCallback() {
    this._timer = setInterval(() => this._tick(), 1000);
    this._tick();
  }

  disconnectedCallback() {
    if (this._timer) clearInterval(this._timer);
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) this._build();
    this._update();
  }

  getCardSize() { return 12; }

  _state(entity) { return this._hass && this._hass.states[entity]; }

  _val(entity, fallback = "--") {
    const s = this._state(entity);
    if (!s || s.state === "unknown" || s.state === "unavailable") return fallback;
    return s.state;
  }

  _num(entity, digits = 0) {
    const raw = this._val(entity, "");
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n.toFixed(digits) : "--";
  }

  _moreInfo(entity) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entity }, bubbles: true, composed: true }));
  }

  _toggle(entity) {
    if (!this._hass) return;
    const s = this._state(entity);
    const domain = entity.split(".")[0];
    if (domain === "fan") {
      this._hass.callService("fan", s && s.state === "on" ? "turn_off" : "turn_on", { entity_id: entity });
    } else {
      this._hass.callService(domain, s && s.state === "on" ? "turn_off" : "turn_on", { entity_id: entity });
    }
  }

  _navigate(path) {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false }, bubbles: true, composed: true }));
  }

  _build() {
    this._built = true;
    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
      <div class="wrap">
        <header>
          <div class="brand">
            <div class="logo"><ha-icon icon="mdi:home-automation"></ha-icon></div>
            <div>
              <div class="title">HOME // CONTROL</div>
              <div class="sub">SMART RESIDENCE · NODE 01</div>
            </div>
          </div>
          <div class="clock">
            <b id="clock">--:--:--</b>
            <span id="date">----</span>
          </div>
          <div class="live"><span class="dot"></span>LIVE</div>
        </header>

        <div class="stats" id="stats"></div>

        <div class="sect">ROOMS / 房间</div>
        <div class="rooms" id="rooms"></div>

        <div class="sect">MI HOME / 米家设备</div>
        <div class="mi" id="mi"></div>

        <div class="sect">WATER PURIFIER / 净水</div>
        <div class="water" id="water"></div>

        <footer id="nav"></footer>
      </div>
    `;

    const statsEl = this.shadowRoot.getElementById("stats");
    this._refs.stats = STATS.map((s, i) => {
      const el = document.createElement("div");
      el.className = "stat";
      el.innerHTML = `
        <div class="row"><ha-icon icon="${s.icon}"></ha-icon>${s.label}</div>
        <div class="val"><span id="stat-${i}">--</span><i>${s.unit}</i></div>`;
      el.addEventListener("click", () => (s.path ? this._navigate(s.path) : this._moreInfo(s.entity)));
      statsEl.appendChild(el);
      return el.querySelector(`#stat-${i}`);
    });

    const roomsEl = this.shadowRoot.getElementById("rooms");
    this._refs.rooms = ROOMS.map((r, i) => {
      const el = document.createElement("div");
      el.className = "room";
      el.innerHTML = `
        <div class="head">
          <div class="nm"><ha-icon icon="${r.icon}"></ha-icon>${r.name}</div>
          <div class="badge" id="room-badge-${i}">--</div>
        </div>
        <div class="temp">
          <b><span id="room-temp-${i}">--</span><i>°C</i></b>
          <small id="room-mode-${i}">--</small>
        </div>
        <div class="extras" id="room-extras-${i}"></div>`;
      if (r.climate) {
        el.addEventListener("click", (ev) => {
          if (ev.target.closest(".chip")) return;
          this._moreInfo(r.climate);
        });
      }
      const extras = el.querySelector(`#room-extras-${i}`);
      const chips = (r.extras || []).map((x) => {
        const c = document.createElement("div");
        c.className = "chip";
        c.innerHTML = `<ha-icon icon="${x.icon}"></ha-icon>${x.name}`;
        c.addEventListener("click", (ev) => {
          ev.stopPropagation();
          this._toggle(x.entity);
        });
        extras.appendChild(c);
        return { el: c, entity: x.entity };
      });
      roomsEl.appendChild(el);
      return {
        el,
        badge: el.querySelector(`#room-badge-${i}`),
        temp: el.querySelector(`#room-temp-${i}`),
        mode: el.querySelector(`#room-mode-${i}`),
        chips,
      };
    });

    const miEl = this.shadowRoot.getElementById("mi");
    this._refs.mi = MI.map((d, i) => {
      const el = document.createElement("div");
      el.className = "mi-tile";
      el.innerHTML = `
        <div class="ico"><ha-icon icon="${d.icon}"></ha-icon></div>
        <div class="info">
          <div class="nm">${d.name}</div>
          <div class="st" id="mi-st-${i}">--</div>
        </div>
        <span class="pwr"></span>`;
      el.addEventListener("click", () => {
        if (d.kind === "switch" || d.kind === "light" || d.kind === "fan") this._toggle(d.entity);
        else this._moreInfo(d.entity);
      });
      miEl.appendChild(el);
      return { el, st: el.querySelector(`#mi-st-${i}`) };
    });

    const waterEl = this.shadowRoot.getElementById("water");
    const R = 30, C = 2 * Math.PI * R;
    this._refs.water = WATER.map((w, i) => {
      const el = document.createElement("div");
      el.className = "ring";
      el.innerHTML = `
        <svg viewBox="0 0 78 78">
          <circle class="track" cx="39" cy="39" r="${R}"></circle>
          <circle class="bar" id="ring-bar-${i}" cx="39" cy="39" r="${R}"
            stroke-dasharray="${C}" stroke-dashoffset="${C}"></circle>
        </svg>
        <div class="num"><span id="ring-num-${i}">--</span><i>${w.unit}</i></div>
        <div class="lbl">${w.label}</div>`;
      el.addEventListener("click", () => this._moreInfo(w.entity));
      waterEl.appendChild(el);
      return {
        el,
        bar: el.querySelector(`#ring-bar-${i}`),
        num: el.querySelector(`#ring-num-${i}`),
        len: C,
      };
    });

    const navEl = this.shadowRoot.getElementById("nav");
    NAV.forEach((n) => {
      const el = document.createElement("div");
      el.className = "nav";
      el.innerHTML = `<ha-icon icon="${n.icon}"></ha-icon>${n.label}`;
      el.addEventListener("click", () => this._navigate(n.path));
      navEl.appendChild(el);
    });

    if (this._hass) this._update();
  }

  _update() {
    if (!this._hass || !this._built) return;

    STATS.forEach((s, i) => {
      const ref = this._refs.stats[i];
      if (!ref) return;
      const digits = s.unit === "¥" ? 2 : s.unit === "ppm" ? 0 : 1;
      ref.textContent = this._num(s.entity, digits);
    });

    ROOMS.forEach((r, i) => {
      const ref = this._refs.rooms[i];
      if (!ref) return;
      if (r.climate) {
        const st = this._state(r.climate);
        const on = !!st && st.state !== "off" && st.state !== "unavailable";
        ref.el.classList.toggle("on", on);
        ref.badge.textContent = on ? (st.state || "").toUpperCase() : "STANDBY";
        const cur = st && st.attributes ? st.attributes.current_temperature : null;
        ref.temp.textContent = cur === null || cur === undefined ? "--" : Number(cur).toFixed(1);
        const target = st && st.attributes ? st.attributes.temperature : null;
        ref.mode.textContent = on ? `SET ${target ?? "--"}°` : "OFF";
      } else {
        ref.el.classList.remove("on");
        ref.badge.textContent = "SENSORS";
        ref.temp.textContent = "--";
        ref.mode.textContent = "NO CLIMATE";
      }
      ref.chips.forEach((c) => {
        const st = this._state(c.entity);
        c.el.classList.toggle("on", !!st && st.state === "on");
      });
    });

    MI.forEach((d, i) => {
      const ref = this._refs.mi[i];
      if (!ref) return;
      const st = this._state(d.entity);
      const s = st && st.state !== "unavailable" && st.state !== "unknown" ? st.state : null;
      let on = false;
      let label = "离线";
      if (s) {
        if (d.kind === "climate") {
          on = s !== "off";
          const cur = st.attributes ? st.attributes.current_temperature : null;
          label = on ? `${s.toUpperCase()}${cur == null ? "" : " · " + Number(cur).toFixed(1) + "°C"}` : "OFF";
        } else if (d.kind === "media_player") {
          on = s === "playing";
          const map = { playing: "PLAYING", paused: "PAUSED", idle: "IDLE", off: "OFF", standby: "STANDBY" };
          label = map[s] || s.toUpperCase();
        } else if (d.kind === "water_heater") {
          on = s !== "off";
          const cur = st.attributes ? st.attributes.current_temperature : null;
          label = on && cur != null ? `${Number(cur).toFixed(0)}°C` : on ? "ON" : "OFF";
        } else {
          on = s === "on";
          label = on ? "ON" : "OFF";
        }
      }
      ref.el.classList.toggle("on", on);
      ref.st.textContent = label;
    });

    WATER.forEach((w, i) => {
      const ref = this._refs.water[i];
      if (!ref) return;
      const raw = parseFloat(this._val(w.entity, "NaN"));
      const ok = Number.isFinite(raw);
      const pct = ok ? Math.min(1, Math.max(0, (raw - w.min) / (w.max - w.min))) : 0;
      ref.bar.style.strokeDashoffset = String(ref.len * (1 - pct));
      ref.num.textContent = ok ? (w.unit === "%" ? Math.round(raw) : Math.round(raw)) : "--";
      ref.el.classList.toggle("bad", ok && (w.unit === "%" ? raw <= 15 : raw > w.good));
      ref.el.classList.toggle("warn", ok && !(w.unit === "%" ? raw <= 15 : raw > w.good) && (w.unit === "%" ? raw <= 30 : false));
    });

    this._tick();
  }

  _tick() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const clock = this.shadowRoot.getElementById("clock");
    const date = this.shadowRoot.getElementById("date");
    if (clock) clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    if (date) {
      const wd = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][now.getDay()];
      date.textContent = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} · ${wd}`;
    }
  }
}

customElements.define("tech-home", TechHomeCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "tech-home",
  name: "Tech Home Console",
  description: "科技感家居总览：房间、净水、用电、快捷入口",
});
