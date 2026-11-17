import * as THREE from "/local/3d/three.module.min.js";

const CX = 5.95;
const CZ = 4.35;
const FLOOR_TOP = 0.08;
const WALL_H = 1.35;
const WALL_T = 0.07;

// 平面坐标（x/z 为左上角，w/d 为宽深），与户型图对应
const ROOMS = [
  { name: "小阳台", x: 1.1, z: 3.8, w: 1.7, d: 1.2, color: 0x2b3f5a },
  { name: "厨房", x: 1.1, z: 5.0, w: 1.7, d: 1.0, color: 0x33465e },
  { name: "书房", x: 2.8, z: 2.2, w: 2.5, d: 1.6, color: 0x2e4763 },
  { name: "次卫", x: 2.8, z: 3.8, w: 2.5, d: 1.4, color: 0x24384d },
  { name: "主卫", x: 5.3, z: 0.8, w: 1.8, d: 1.8, color: 0x24384d },
  { name: "主卧", x: 7.1, z: 0.8, w: 3.4, d: 3.0, color: 0x35496a },
  { name: "次卧", x: 7.1, z: 3.8, w: 3.4, d: 2.2, color: 0x2e4763 },
  { name: "客厅", x: 2.8, z: 6.0, w: 8.0, d: 1.9, color: 0x3a4f6d },
];

// 简化家具（x/z 中心，w/d 宽深，h 高，y0 离地偏移）
const FURNITURE = [
  // 主卧
  { x: 8.55, z: 2.05, w: 1.9, d: 2.1, h: 0.34, color: 0x6f8db4, name: "bed" },
  { x: 8.55, z: 1.22, w: 1.7, d: 0.42, h: 0.14, y0: 0.34, color: 0xc6d8ea, name: "pillow" },
  { x: 7.42, z: 1.05, w: 0.42, d: 0.42, h: 0.36, color: 0x5c7a9c, name: "cab" },
  { x: 9.68, z: 1.05, w: 0.42, d: 0.42, h: 0.36, color: 0x5c7a9c, name: "cab" },
  { x: 10.28, z: 2.6, w: 0.42, d: 1.7, h: 1.05, color: 0x4e6c8f, name: "wardrobe" },
  // 次卧
  { x: 9.35, z: 5.05, w: 1.25, d: 1.95, h: 0.32, color: 0x6f8db4, name: "bed" },
  { x: 9.35, z: 4.24, w: 1.1, d: 0.34, h: 0.12, y0: 0.32, color: 0xc6d8ea, name: "pillow" },
  { x: 7.62, z: 5.35, w: 0.62, d: 1.1, h: 0.48, color: 0x5c7a9c, name: "desk" },
  // 书房
  { x: 4.05, z: 3.35, w: 1.45, d: 0.55, h: 0.48, color: 0x5c7a9c, name: "desk" },
  { x: 3.05, z: 2.95, w: 0.26, d: 1.3, h: 1.0, color: 0x4e6c8f, name: "shelf" },
  // 客厅
  { x: 5.15, z: 7.42, w: 2.5, d: 0.78, h: 0.46, color: 0x6789b2, name: "sofa" },
  { x: 5.15, z: 7.76, w: 2.5, d: 0.18, h: 0.3, y0: 0.46, color: 0x7796bb, name: "sofa-back" },
  { x: 5.15, z: 6.72, w: 1.35, d: 0.55, h: 0.3, color: 0x54719a, name: "table" },
  { x: 9.55, z: 7.55, w: 1.7, d: 0.36, h: 0.34, color: 0x54719a, name: "tv-cab" },
  // 厨房
  { x: 1.95, z: 5.38, w: 1.45, d: 0.56, h: 0.62, color: 0x5b7ba2, name: "counter" },
  { x: 1.42, z: 5.86, w: 0.6, d: 0.5, h: 1.15, color: 0x6a88ae, name: "fridge" },
  // 小阳台
  { x: 1.48, z: 4.35, w: 0.56, d: 0.56, h: 0.72, color: 0x6a88ae, name: "washer" },
  // 主卫
  { x: 5.8, z: 2.05, w: 0.7, d: 1.32, h: 0.3, color: 0x527c97, name: "tub" },
  { x: 6.85, z: 1.02, w: 0.4, d: 0.52, h: 0.32, color: 0x527c97, name: "wc" },
  // 次卫
  { x: 3.35, z: 4.55, w: 0.86, d: 0.86, h: 0.05, color: 0x3f6b86, name: "shower" },
  { x: 4.85, z: 4.95, w: 0.4, d: 0.52, h: 0.32, color: 0x527c97, name: "wc" },
  { x: 3.2, z: 5.02, w: 0.62, d: 0.34, h: 0.48, color: 0x527c97, name: "sink" },
];

// 设备点位与实体
const DEVICES = [
  { entity: "climate.208907210826263_climate", name: "书房空调", x: 4.35, z: 2.55, kind: "ac", lx: 0.35, lz: -0.3 },
  { entity: "climate.210006722454675_climate", name: "客厅空调", x: 6.45, z: 6.45, kind: "ac", lx: 0.45, lz: -0.35 },
  { entity: "switch.chuang_wei_dian_shi", name: "创维电视", x: 9.55, z: 7.5, kind: "tv", lx: 0.2, lz: 0.42 },
  { entity: "climate.211106234581522_climate", name: "次卧空调", x: 9.6, z: 4.15, kind: "ac", lx: 0.4, lz: -0.3 },
  { entity: "fan.211106238582802_fan", name: "抽油烟机", x: 1.75, z: 5.3, kind: "fan", lx: -0.55, lz: -0.3 },
  { entity: "sensor.210006722454684_out_tds", name: "净水 TDS", x: 2.15, z: 5.68, kind: "sensor", lx: 0.5, lz: 0.38 },
];

const STYLE = `
  :host { display: block; }
  .wrap { position: relative; width: 100%; height: var(--floor3d-height, 560px); border-radius: 18px;
    overflow: hidden; background:
      radial-gradient(120% 90% at 50% -10%, #1d3050 0%, #0d1524 45%, #060a11 100%); }
  canvas { display: block; width: 100%; height: 100%; touch-action: none; cursor: grab; }
  canvas.dragging { cursor: grabbing; }
  .hint { position: absolute; left: 14px; bottom: 12px; font-size: 12px; color: #8ea6c6;
    letter-spacing: .3px; pointer-events: none; }
  .panel { position: absolute; left: 14px; top: 14px; min-width: 200px; padding: 12px 14px;
    border-radius: 12px; background: rgba(12, 20, 34, .84); border: 1px solid rgba(110, 150, 210, .25);
    color: #dce7f7; font: 13px/1.5 "Microsoft YaHei", system-ui, sans-serif;
    backdrop-filter: blur(10px); display: none; }
  .panel.open { display: block; }
  .panel h3 { margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #eaf2ff; }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 4px 0; }
  .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px;
    background: #5a6b82; }
  .dot.on { background: #35d0ff; box-shadow: 0 0 8px #35d0ff; }
  .dot.sensor { background: #4bd6a8; box-shadow: 0 0 8px #4bd6a8; }
  .row button { border: 1px solid rgba(120, 170, 240, .4); background: rgba(40, 70, 120, .55);
    color: #cfe6ff; border-radius: 8px; padding: 3px 10px; font-size: 12px; cursor: pointer; }
  .row button:hover { background: rgba(60, 100, 165, .8); }
  .close { position: absolute; right: 10px; top: 8px; cursor: pointer; color: #8fa4c4; }
  .zoom { position: absolute; right: 12px; bottom: 12px; display: flex; flex-direction: column; gap: 6px; }
  .zoom button { width: 34px; height: 34px; border-radius: 10px; cursor: pointer;
    border: 1px solid rgba(120, 170, 240, .28); background: rgba(16, 26, 42, .82);
    color: #cfe0f5; font-size: 17px; line-height: 1; backdrop-filter: blur(8px); }
  .zoom button:hover { background: rgba(46, 78, 128, .92); }
`;

class Floor3DCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {};
    this._markers = [];
    this._roomMeshes = [];
    this._stateCache = {};
    this._ready = false;
  }

  setConfig(config) {
    this._config = config || {};
    if (this._built) {
      this.style.setProperty("--floor3d-height", (this._config.height || 560) + "px");
    }
  }

  getCardSize() {
    return 9;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._ready) {
      this._init();
      this._ready = true;
    }
    this._syncStates();
  }

  connectedCallback() {
    if (this._ready) this._resize();
  }

  disconnectedCallback() {
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._observer) this._observer.disconnect();
  }

  _init() {
    this.style.setProperty("--floor3d-height", (this._config.height || 560) + "px");
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <div class="wrap">
        <canvas></canvas>
        <div class="panel"><span class="close">\u2715</span><h3></h3><div class="list"></div></div>
        <div class="hint">\u62d6\u52a8\u65cb\u8f6c \u00b7 \u53cc\u6307\u6216\u6eda\u8f6e\u7f29\u653e \u00b7 \u70b9\u51fb\u623f\u95f4\u805a\u7126 \u00b7 \u70b9\u51fb\u5149\u70b9\u5f00\u5173</div>
        <div class="zoom">
          <button data-z="in" title="\u653e\u5927">+</button>
          <button data-z="out" title="\u7f29\u5c0f">\u2212</button>
          <button data-z="fit" title="\u590d\u4f4d">\u27f3</button>
        </div>
      </div>`;

    this._wrap = this.shadowRoot.querySelector(".wrap");
    this._canvas = this.shadowRoot.querySelector("canvas");
    this._panel = this.shadowRoot.querySelector(".panel");
    this._panelTitle = this._panel.querySelector("h3");
    this._panelList = this._panel.querySelector(".list");
    this._panel.querySelector(".close").addEventListener("click", () => this._closePanel());

    const renderer = new THREE.WebGLRenderer({ canvas: this._canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    this._renderer = renderer;

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);

    this._scene.add(new THREE.AmbientLight(0xdfe9ff, 0.5));
    this._scene.add(new THREE.HemisphereLight(0xbcd7ff, 0x0a1220, 0.75));

    const key = new THREE.DirectionalLight(0xd6e6ff, 1.6);
    key.position.set(9, 15, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -12;
    key.shadow.camera.right = 12;
    key.shadow.camera.top = 12;
    key.shadow.camera.bottom = -12;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 45;
    key.shadow.bias = -0.0015;
    this._scene.add(key);

    const rim = new THREE.DirectionalLight(0x4f86d6, 0.55);
    rim.position.set(-10, 7, -8);
    this._scene.add(rim);

    this._world = new THREE.Group();
    this._world.position.set(-CX, 0, -CZ);
    this._scene.add(this._world);

    this._buildBase();
    this._buildRooms();
    this._buildWalls();
    this._buildFurniture();
    this._buildDevices();

    this._orbit = { theta: -0.52, phi: 0.72, radius: 20 };
    this._target = new THREE.Vector3(0, 0.35, 0);
    this._desired = { theta: this._orbit.theta, phi: this._orbit.phi, radius: this._orbit.radius };
    this._targetGoal = this._target.clone();

    this._bindPointer();
    this._observer = new ResizeObserver(() => this._resize());
    this._observer.observe(this._wrap);
    this._resize();
    this._animate();
  }

  _resize() {
    if (!this._renderer) return;
    const width = this._wrap.clientWidth || 600;
    const height = this._wrap.clientHeight || 400;
    this._renderer.setSize(width, height, false);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
    if (!this._userZoom) {
      const radius = this._fitRadius();
      this._orbit.radius = radius;
      this._desired.radius = radius;
    }
  }

  _fitRadius() {
    const aspect = this._camera.aspect || 1;
    const vHalf = (this._camera.fov / 2) * Math.PI / 180;
    const tanV = Math.tan(vHalf);
    const tanH = tanV * aspect;

    // 用户型包围盒的 8 个角点投影求最小可容纳距离，让模型尽量铺满
    const b = this._bounds();
    const cx = b.x0 + b.w / 2 - CX;
    const cz = b.z0 + b.d / 2 - CZ;
    const theta = this._desired ? this._desired.theta : -0.58;
    const phi = this._desired ? this._desired.phi : 0.72;
    const dir = new THREE.Vector3(
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.cos(theta)
    ).normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
    const up = new THREE.Vector3().crossVectors(dir, right).normalize();

    let need = 0;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        for (const y of [0, 1.5]) {
          const rel = new THREE.Vector3(cx + (sx * b.w) / 2, y - 0.35, cz + (sz * b.d) / 2);
          const depth = rel.dot(dir);
          const needH = depth + Math.abs(rel.dot(right)) / tanH;
          const needV = depth + Math.abs(rel.dot(up)) / tanV;
          need = Math.max(need, needH, needV);
        }
      }
    }
    return need * 1.02;
  }

  _bounds() {
    let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
    for (const room of ROOMS) {
      x0 = Math.min(x0, room.x);
      z0 = Math.min(z0, room.z);
      x1 = Math.max(x1, room.x + room.w);
      z1 = Math.max(z1, room.z + room.d);
    }
    return { x0, z0, x1, z1, w: x1 - x0, d: z1 - z0 };
  }

  _buildBase() {
    const b = this._bounds();
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(b.w + 0.5, 0.24, b.d + 0.5),
      new THREE.MeshStandardMaterial({ color: 0x0e1726, roughness: 0.9, metalness: 0.1 })
    );
    plate.position.set(b.x0 + b.w / 2, -0.12, b.z0 + b.d / 2);
    plate.receiveShadow = true;
    this._world.add(plate);

    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(b.w + 0.5, 0.24, b.d + 0.5)),
      new THREE.LineBasicMaterial({ color: 0x2b4a72, transparent: true, opacity: 0.85 })
    );
    edge.position.copy(plate.position);
    this._world.add(edge);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x080d16, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.25;
    ground.receiveShadow = true;
    this._world.add(ground);
  }

  _buildRooms() {
    for (const room of ROOMS) {
      const geo = new THREE.BoxGeometry(room.w - 0.03, FLOOR_TOP, room.d - 0.03);
      const mat = new THREE.MeshStandardMaterial({
        color: room.color, roughness: 0.72, metalness: 0.16,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(room.x + room.w / 2, FLOOR_TOP / 2, room.z + room.d / 2);
      mesh.userData.room = room;
      mesh.receiveShadow = true;
      this._world.add(mesh);
      this._roomMeshes.push(mesh);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0x74a4e0, transparent: true, opacity: 0.5 })
      );
      edges.position.copy(mesh.position);
      this._world.add(edges);

      const label = this._textSprite(room.name, "#a8c6ea", 38, 600, false);
      label.position.set(mesh.position.x, FLOOR_TOP + 0.02, mesh.position.z);
      label.scale.set(1.5, 0.375, 1);
      label.renderOrder = 10;
      this._world.add(label);
      mesh.userData.label = label;
    }
  }

  _wallSegments() {
    const seen = new Set();
    const list = [];
    const push = (x1, z1, x2, z2) => {
      const a = [x1, z1, x2, z2].map((v) => v.toFixed(2)).join(",");
      const b = [x2, z2, x1, z1].map((v) => v.toFixed(2)).join(",");
      if (seen.has(a) || seen.has(b)) return;
      seen.add(a);
      list.push([x1, z1, x2, z2]);
    };
    for (const r of ROOMS) {
      push(r.x, r.z, r.x + r.w, r.z);
      push(r.x, r.z + r.d, r.x + r.w, r.z + r.d);
      push(r.x, r.z, r.x, r.z + r.d);
      push(r.x + r.w, r.z, r.x + r.w, r.z + r.d);
    }
    return list;
  }

  _buildWalls() {
    const glass = new THREE.MeshStandardMaterial({
      color: 0x8fb9f0, transparent: true, opacity: 0.14, roughness: 0.1,
      metalness: 0.0, side: THREE.DoubleSide, depthWrite: false,
    });
    const railMat = new THREE.MeshBasicMaterial({ color: 0x9dc6f5, transparent: true, opacity: 0.85 });

    for (const [x1, z1, x2, z2] of this._wallSegments()) {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      if (len < 0.05) continue;

      const isVertical = Math.abs(dx) < 0.001;
      const cx = (x1 + x2) / 2;
      const cz = (z1 + z2) / 2;

      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(isVertical ? WALL_T : len, WALL_H, isVertical ? len : WALL_T),
        glass
      );
      panel.position.set(cx, FLOOR_TOP + WALL_H / 2, cz);
      panel.renderOrder = 3;
      this._world.add(panel);

      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(isVertical ? WALL_T * 1.5 : len, 0.035, isVertical ? len : WALL_T * 1.5),
        railMat
      );
      rail.position.set(cx, FLOOR_TOP + WALL_H, cz);
      this._world.add(rail);
    }
  }

  _buildFurniture() {
    for (const item of FURNITURE) {
      const height = item.h;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(item.w, height, item.d),
        new THREE.MeshStandardMaterial({
          color: item.color, roughness: 0.62, metalness: 0.08,
        })
      );
      mesh.position.set(item.x, FLOOR_TOP + (item.y0 || 0) + height / 2, item.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this._world.add(mesh);

      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({ color: 0xa6c4e6, transparent: true, opacity: 0.16 })
      );
      edge.position.copy(mesh.position);
      this._world.add(edge);
    }
  }

  _buildDevices() {
    for (const device of DEVICES) {
      const group = new THREE.Group();
      group.position.set(device.x, FLOOR_TOP, device.z);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 0.28, 8),
        new THREE.MeshBasicMaterial({ color: 0x5a6b82, transparent: true, opacity: 0.55 })
      );
      stem.position.y = 0.14;
      group.add(stem);

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0x6a7f99, emissive: 0x0a1522, emissiveIntensity: 0.2, roughness: 0.3 })
      );
      sphere.position.y = 0.34;
      sphere.castShadow = true;
      sphere.userData.device = device;
      group.add(sphere);

      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this._glowTexture(), color: 0x35d0ff, transparent: true, opacity: 0.0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      glow.position.y = 0.34;
      glow.scale.set(1.0, 1.0, 1);
      group.add(glow);

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.2, 0.28, 40),
        new THREE.MeshBasicMaterial({ color: 0x35d0ff, transparent: true, opacity: 0.14, side: THREE.DoubleSide })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = 0.012;
      group.add(halo);

      const label = this._textSprite(device.name, "#d9e8fb", 34, 600, false);
      label.position.set(device.lx || 0, 0.6, device.lz || 0);
      label.scale.set(1.3, 0.325, 1);
      label.renderOrder = 20;
      label.visible = false;
      group.add(label);

      this._world.add(group);
      this._markers.push({ device, sphere, halo, glow, label, stem });
    }
  }

  _glowTexture() {
    if (this._glowTex) return this._glowTex;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,0.95)");
    grad.addColorStop(0.3, "rgba(150,220,255,0.32)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    this._glowTex = new THREE.CanvasTexture(canvas);
    return this._glowTex;
  }

  _textSprite(text, color, fontSize, weight, visible = true) {
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = 512 * scale;
    canvas.height = 128 * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.font = `${weight >= 600 ? 600 : 400} ${fontSize}px "Microsoft YaHei", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.shadowColor = "rgba(0,0,0,.8)";
    ctx.shadowBlur = 8;
    ctx.fillText(text, 256, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({
      map: texture, transparent: true, depthWrite: false, depthTest: visible,
    });
    return new THREE.Sprite(material);
  }

  _syncStates() {
    if (!this._hass || !this._markers.length) return;
    for (const marker of this._markers) {
      const stateObj = this._hass.states[marker.device.entity];
      const state = stateObj ? stateObj.state : "unavailable";
      const active = !!(stateObj && (marker.device.kind === "sensor" || ["on", "heat", "cool", "dry", "fan_only", "auto", "open"].includes(state)));
      const key = state + "|" + active;
      if (this._stateCache[marker.device.entity] === key) continue;
      this._stateCache[marker.device.entity] = key;

      const isSensor = marker.device.kind === "sensor";
      const on = !isSensor && active;
      const color = isSensor ? 0x4bd6a8 : on ? 0x35d0ff : 0x7c8fa6;

      marker.sphere.material.color.setHex(on || isSensor ? 0xbfeaff : 0x6b7d92);
      marker.sphere.material.emissive.setHex(color);
      marker.sphere.material.emissiveIntensity = on || isSensor ? 1.15 : 0.15;
      marker.halo.material.color.setHex(color);
      marker.halo.material.opacity = on || isSensor ? 0.4 : 0.1;
      marker.glow.material.color.setHex(color);
      marker.glow.material.opacity = on || isSensor ? 0.85 : 0.0;
      marker.stem.material.color.setHex(color);

      const value = isSensor
        ? `${marker.device.name} ${state}`
        : `${marker.device.name} ${on ? "\u5f00\u542f" : "\u5173\u95ed"}`;
      this._setMarkerText(marker, value);
    }
    this._renderPanel();
  }

  _setMarkerText(marker, text) {
    if (marker.text === text) return;
    marker.text = text;
    const material = marker.label.material;
    const canvas = material.map.image;
    const ctx = canvas.getContext("2d");
    const scale = 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);
    ctx.font = `600 34px "Microsoft YaHei", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#d9e8fb";
    ctx.shadowColor = "rgba(0,0,0,.8)";
    ctx.shadowBlur = 8;
    ctx.fillText(text, 256, 64);
    ctx.restore();
    material.map.needsUpdate = true;
  }

  _clampRadius(value) {
    return Math.min(45, Math.max(3.5, value));
  }

  _pinchDistance(points) {
    const list = [...points.values()];
    if (list.length < 2) return 0;
    return Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
  }

  _bindPointer() {
    const points = new Map();
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let pinchDist = 0;

    this._canvas.addEventListener("pointerdown", (event) => {
      points.set(event.pointerId, { x: event.clientX, y: event.clientY });
      this._canvas.setPointerCapture(event.pointerId);
      if (points.size === 1) {
        moved = 0;
        lastX = event.clientX;
        lastY = event.clientY;
      } else if (points.size === 2) {
        pinchDist = this._pinchDistance(points);
        moved = 999;
        this._canvas.classList.add("dragging");
      }
    });

    this._canvas.addEventListener("pointermove", (event) => {
      if (!points.has(event.pointerId)) return;
      points.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (points.size >= 2) {
        const dist = this._pinchDistance(points);
        if (pinchDist > 0 && dist > 0) {
          this._userZoom = true;
          this._desired.radius = this._clampRadius(this._desired.radius * (pinchDist / dist));
        }
        pinchDist = dist;
        return;
      }

      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 4) this._canvas.classList.add("dragging");
      this._desired.theta -= dx * 0.006;
      this._desired.phi = Math.min(1.4, Math.max(0.16, this._desired.phi - dy * 0.005));
    });

    const finish = (event) => {
      points.delete(event.pointerId);
      pinchDist = 0;
      if (points.size === 0) {
        this._canvas.classList.remove("dragging");
        if (moved < 6) this._pick(event);
      } else {
        const rest = [...points.values()][0];
        lastX = rest.x;
        lastY = rest.y;
      }
    };

    this._canvas.addEventListener("pointerup", finish);
    this._canvas.addEventListener("pointercancel", finish);

    this._canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      this._userZoom = true;
      this._desired.radius = this._clampRadius(this._desired.radius + event.deltaY * 0.012);
    }, { passive: false });

    for (const button of this.shadowRoot.querySelectorAll(".zoom button")) {
      button.addEventListener("click", () => {
        const action = button.dataset.z;
        if (action === "in") {
          this._userZoom = true;
          this._desired.radius = this._clampRadius(this._desired.radius * 0.8);
        } else if (action === "out") {
          this._userZoom = true;
          this._desired.radius = this._clampRadius(this._desired.radius * 1.25);
        } else {
          this._userZoom = false;
          this._desired.radius = this._fitRadius();
          this._targetGoal.set(0, 0.35, 0);
          this._activeRoom = null;
          this._panel.classList.remove("open");
        }
      });
    }
  }

  _pick(event) {
    const rect = this._canvas.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, this._camera);

    const spheres = this._markers.map((marker) => marker.sphere);
    const hitDevice = raycaster.intersectObjects(spheres, false)[0];
    if (hitDevice) {
      const device = hitDevice.object.userData.device;
      if (device.kind === "sensor") {
        this.dispatchEvent(new CustomEvent("hass-more-info", {
          detail: { entityId: device.entity }, bubbles: true, composed: true,
        }));
      } else if (this._hass) {
        this._hass.callService("homeassistant", "toggle", { entity_id: device.entity });
      }
      return;
    }

    const hitRoom = raycaster.intersectObjects(this._roomMeshes, false)[0];
    if (hitRoom) this._focusRoom(hitRoom.object.userData.room);
  }

  _focusRoom(room) {
    this._activeRoom = room;
    this._targetGoal.set(room.x + room.w / 2 - CX, 0.3, room.z + room.d / 2 - CZ);
    this._desired.radius = Math.max(room.w, room.d) * 2.1 + 5.5;
    for (const mesh of this._roomMeshes) {
      const active = mesh.userData.room === room;
      mesh.material.emissive.setHex(active ? 0x1d4a7a : 0x000000);
      mesh.material.emissiveIntensity = active ? 0.55 : 0;
    }
    this._panelTitle.textContent = room.name;
    this._panel.classList.add("open");
    this._renderPanel();
  }

  _closePanel() {
    this._activeRoom = null;
    this._panel.classList.remove("open");
    this._targetGoal.set(0, 0.35, 0);
    this._userZoom = false;
    this._desired.radius = this._fitRadius();
    for (const mesh of this._roomMeshes) {
      mesh.material.emissive.setHex(0x000000);
      mesh.material.emissiveIntensity = 0;
    }
  }

  _roomDevices(room) {
    return DEVICES.filter(
      (device) =>
        device.x >= room.x - 0.2 && device.x <= room.x + room.w + 0.2 &&
        device.z >= room.z - 0.2 && device.z <= room.z + room.d + 0.2
    );
  }

  _renderPanel() {
    if (!this._activeRoom || !this._hass) return;
    const devices = this._roomDevices(this._activeRoom);
    this._panelList.innerHTML = devices.map((device) => {
      const stateObj = this._hass.states[device.entity];
      const state = stateObj ? stateObj.state : "unavailable";
      const isSensor = device.kind === "sensor";
      const on = !isSensor && !!stateObj && ["on", "heat", "cool", "dry", "fan_only", "auto", "open"].includes(state);
      const dotClass = isSensor ? "dot sensor" : on ? "dot on" : "dot";
      const value = isSensor ? `${state}` : on ? "\u5f00\u542f" : "\u5173\u95ed";
      const button = isSensor ? "" : `<button data-entity="${device.entity}">${on ? "\u5173\u95ed" : "\u6253\u5f00"}</button>`;
      return `<div class="row"><span><span class="${dotClass}"></span>${device.name}</span><span>${value}${button}</span></div>`;
    }).join("") || `<div class="row">\u8fd9\u4e2a\u623f\u95f4\u6682\u65e0\u8bbe\u5907</div>`;

    this._panelList.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        if (this._hass) this._hass.callService("homeassistant", "toggle", { entity_id: button.dataset.entity });
      });
    });
  }

  _animate() {
    this._raf = requestAnimationFrame(() => this._animate());

    this._orbit.theta += (this._desired.theta - this._orbit.theta) * 0.12;
    this._orbit.phi += (this._desired.phi - this._orbit.phi) * 0.12;
    this._orbit.radius += (this._desired.radius - this._orbit.radius) * 0.12;
    this._target.lerp(this._targetGoal, 0.1);

    const { theta, phi, radius } = this._orbit;
    this._camera.position.set(
      this._target.x + radius * Math.sin(phi) * Math.sin(theta),
      this._target.y + radius * Math.cos(phi),
      this._target.z + radius * Math.sin(phi) * Math.cos(theta)
    );
    this._camera.lookAt(this._target);

    const time = performance.now() * 0.001;
    const showLabels = this._orbit.radius < 12.5;
    const focusDevices = this._activeRoom ? this._roomDevices(this._activeRoom) : null;
    for (const mesh of this._roomMeshes) {
      mesh.userData.label.visible = mesh.userData.room !== this._activeRoom;
    }
    for (const marker of this._markers) {
      const pulse = 1 + Math.sin(time * 2 + marker.device.x) * 0.14;
      marker.halo.scale.set(pulse, pulse, 1);
      const glowPulse = 1 + Math.sin(time * 2.4 + marker.device.z) * 0.08;
      marker.glow.scale.set(0.95 * glowPulse, 0.95 * glowPulse, 1);
      marker.label.visible = focusDevices ? focusDevices.includes(marker.device) : showLabels;
    }

    this._renderer.render(this._scene, this._camera);
  }
}

customElements.define("floor3d-card", Floor3DCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "floor3d-card",
  name: "3D 户型",
  description: "可拖动旋转、点击房间聚焦的三维户型控制面板",
});
