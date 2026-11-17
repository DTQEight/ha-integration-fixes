# floor3d-card（自绘 3D 户型卡片）

纯 Three.js 实现的 3D 户型：墙体玻璃质感、简化家具、地板分色、阴影与自动取景，支持自由缩放。不依赖 picture-elements / floorplan 卡。

## 组成

| 文件 | 说明 |
|---|---|
| `floor3d-card.js` | 卡片本体，户型、家具、设备点位都写在文件顶部常量里 |
| `three.module.min.js` | Three.js 运行时，卡片通过 `/local/3d/three.module.min.js` 引入 |

## 安装

```bash
mkdir -p /path/to/config/www/3d
cp floor3d-card.js three.module.min.js /path/to/config/www/3d/
```

注册模块（**必须带版本号**，否则浏览器 31 天强缓存会让更新看不见）：

```yaml
frontend:
  extra_module_url:
    - /local/3d/floor3d-card.js?v=5
```

仪表盘使用：

```yaml
type: custom:floor3d-card
height: 560
```

## 交互

| 操作 | 效果 |
|---|---|
| 单指拖动 / 左键拖动 | 旋转视角 |
| 双指捏合 / 滚轮 | 缩放，范围 3.5–45 |
| 右下角 `+` / `-` | 步进缩放 |
| 右下角 `⟳` | 复位到自动取景 |
| 长按 / 右键拖动 | 平移 |

自动取景用 8 个包围盒角点投影，计算相机最小距离，切换窗口尺寸会自动重算，保证户型铺满可视区。

## 自定义

户型数据是文件顶部常量，直接改即可：

- `ROOMS`：房间名、平面坐标（x/z 左上角）、宽深、地板颜色
- `FURNITURE`：中心坐标、宽深高、离地偏移、颜色
- 设备点位：`markers`，`device.entity` 绑定 HA 实体，按 `states[entity].state` 改变颜色/发光

坐标单位为米（1 单位 ≈ 1 米），与房间实际尺寸一致。

## 注意

- 模块 URL 的 `?v=N` 每次改脚本都要 +1，否则 HA 前端缓存不会刷新。
- 同时把资源写进 `.storage/lovelace_resources`，否则部分客户端不加载 `extra_module_url`。
- 需要 WebGL；远程桌面或禁用硬件加速的环境会出现空白画布。
