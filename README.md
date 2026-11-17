# 自用 Home Assistant 集成修复

个人在真实环境里踩到、并且验证过修复效果的 HA 相关补丁合集。每条都写清楚**现象 → 根因 → 改了什么**，方便以后对照版本回查。

## 收录内容

| 目录 | 类型 | 内容 |
|---|---|---|
| [`custom_components/china_southern_power_grid_stat`](custom_components/china_southern_power_grid_stat) | 完整集成 | 南方电网电费集成，修复新版 HA 打开「配置」时的 `OptionsFlow` 崩溃 |
| [`patches/midea_ac_lan`](patches/midea_ac_lan) | 补丁 | 美的空调（Midea AC LAN）局域网发现地址被路由器改写成网关，导致添加设备失败 |
| [`docs/bemfa-cloud-sync.md`](docs/bemfa-cloud-sync.md) | 配置说明 | HA 设备同步到巴法云（Bemfa Cloud），再由米家/小爱同学语音控制 |
| [`dashboards/csg-dashboard.yaml`](dashboards/csg-dashboard.yaml) | 仪表盘 | 用电仪表盘，纯内置卡片，无前端依赖 |
| [`custom_components/map_tiles`](custom_components/map_tiles) | 完整集成 | HA 2026.11 地图底图空白：服务端代理 OSM 瓦片超时，改为走本地 HTTP 代理 |
| [`patches/map_tiles`](patches/map_tiles) | 补丁 | 上述 map_tiles 的两行 diff，便于 HA 升级后重新套用 |
| [`dashboards/sixty-hub`](dashboards/sixty-hub) | 仪表盘 + 脚本 | 60s 全部接口接入 HA：本地容器 + `sixy.py` 聚合 + 8 个 `command_line` 传感器 + 自绘卡片 |
| [`dashboards/floor3d`](dashboards/floor3d) | 前端卡片 | 纯 Three.js 自绘 3D 户型卡片，玻璃墙、家具、自动取景、自由缩放 |
| [`config`](config) | 完整配置快照 | 当前 HA 全部功能：configuration / automations / scripts / scenes / www / blueprints / 仪表盘 / 6 个自定义集成 |
| [`deploy/docker-compose.yml`](deploy/docker-compose.yml) | 部署 | HA（host 网络）+ 60s（4399）的容器编排模板 |

安装方式：完整集成直接复制 `custom_components/<集成>` 到 HA 的 `config/custom_components/`；补丁按各自目录里的说明应用；需要整套复刻时直接用 `config/`。

---

## 1. 南方电网电费集成

基于 [CubicPill/china_southern_power_grid_stat](https://github.com/CubicPill/china_southern_power_grid_stat) 的 fork，改动只有一处兼容性修复：

- 新版 Home Assistant 中 `OptionsFlow.config_entry` 变成只读属性，原代码 `self.config_entry = config_entry` 会抛
  `AttributeError: property 'config_entry' of 'CSGOptionsFlowHandler' object has no setter`，
  导致点「配置」直接报错。改为私有字段 + 只读属性。

复制安装：

```bash
cp -r custom_components/china_southern_power_grid_stat /path/to/config/custom_components/
```

### 附带的仪表盘

`dashboards/csg-dashboard.yaml` 是一套现成的「用电」仪表盘，用 HA 内置卡片（tile / sections / history-graph / markdown）搭成，不依赖任何 HACS 前端组件：

- 渐变头部：余额、欠费、本月用电与电费
- 本月：本月用电/电费、昨日用电、最近日用电/电费
- 阶梯电量：当前档位、剩余电量、电价
- 月度与年度对比：上月、今年、去年
- 近 7 天用电趋势图

启用方法：

1. 把 `csg-dashboard.yaml` 放到 HA 配置目录（与 `configuration.yaml` 同级）
2. 在 `configuration.yaml` 追加：

```yaml
lovelace:
  mode: storage
  dashboards:
    csg-power:
      mode: yaml
      title: 用电
      icon: mdi:lightning-bolt
      show_in_sidebar: true
      require_admin: false
      filename: csg-dashboard.yaml
```

3. 重启 HA，访问 `/csg-power`

> 实体 ID 形如 `sensor.csgaccount_<账号>_<缴费号>_balance`，请把文件里的 `csgaccount` 前缀替换成你自己的。想让 HA 首页直接显示这个仪表盘：左下角头像 → 仪表盘 → 默认仪表盘 → 选「用电」。

## 支持功能

- ✅支持南方电网覆盖范围内的电费数据查询（广东、广西、云南、贵州、海南）
- ✅支持使用手机号、短信验证码和密码（可选）登录，支持南网在线APP、微信、支付宝扫码登录
- ✅支持多个南网账户（每个账户一个集成），支持单个账户下的多个缴费号
- ✅数据自动抓取和更新（默认间隔4小时，可配置）
- ✅全程GUI配置，无需编辑yaml进行配置（暂不支持yaml配置）

可接入如下数据：

- 当前余额和欠费
- 当前阶梯电量数据（档位、阶梯剩余电量、阶梯电价）
- 昨日用电量
- 最新一日用电量、电费（取有数据的最近一日）
- 本年度总用电量、总电费（非实时，更新到上个月）
- 本年度每月用电量、电费（非实时，更新到上个月）
- 上年度总用电量、总电费
- 上年度每月用电量、电费
- 当月累计用电量、电费（非实时，有2天左右的延迟）
- 当月每日用电量、电费（非实时，有2天左右的延迟）
- 上月累计用电量、电费
- 上月每日用电量、电费

❌**不支持**阶梯电费设置（仅能获取当前所在阶梯）、峰谷电价设置和电费计算（本插件只进行数据抓取和转换，不进行任何计算），
暂时也没有支持计划（南网暂时没有统一的API），如有需求，建议单独创建对应的电价实体。

❌因为南网登录API调整，不再支持登录态失效之后自动重新登录，需要手动重新登录。
## 使用方法

使用[HACS](https://hacs.xyz/)添加本仓库（自定义仓库），或直接复制 `custom_components/china_southern_power_grid_stat` 到 HA 的配置目录。

注意：本集成需求`Home Assistant`最低版本为`2022.11`。

### 配置界面

支持的登录方式

<img src="https://raw.githubusercontent.com/CubicPill/china_southern_power_grid_stat/master/img/setup_login.png" alt="" style="width: 400px;">

配置界面

<img src="https://raw.githubusercontent.com/CubicPill/china_southern_power_grid_stat/master/img/setup_add_account.png" alt="" style="width: 400px;">

添加缴费号

<img src="https://raw.githubusercontent.com/CubicPill/china_southern_power_grid_stat/master/img/setup_select_account.png" alt="" style="width: 400px;">

传感器列表
- 余额
- 欠费
- 当前阶梯档位
- 当前阶梯剩余电量
- 当前阶梯电价
- 上月电费
- 上月用电量
- 当月用电量
- 当月电费
- 本年度电费
- 本年度用电量
- 上年度电费
- 上年度用电量
- 最近日用电量
- 最近日电费
- 昨日用电量




传感器额外参数（每月用量、每日用量）

<img src="https://raw.githubusercontent.com/CubicPill/china_southern_power_grid_stat/master/img/sensor_attr.png" alt="" style="width: 400px;">

参数设置

<img src="https://raw.githubusercontent.com/CubicPill/china_southern_power_grid_stat/master/img/setup_params.png" alt="" style="width: 400px;">

### 数据更新策略

由于上月数据和去年数据在生成之后一般不会发生变化，因此对于上月累计用电量、上月每日用电量、上年度累计用电量、上年度每月用电量，数据更新间隔将会与一般更新间隔有所不同。
具体更新策略如下：

对于上月数据，在每月前3天（1~3日）将会跟随一般更新间隔更新（默认为4小时），其余时间将会停止更新，但数据依然可用。

对于去年数据，在每年一月的前7天（1月1日~1月7日）将会每天更新（在每天第一次触发更新时更新），其余时间将会停止更新，但数据依然可用。

如果需要强制刷新数据，重载集成即可。

## 一些技术细节

### 登录接口加密原理

登录接口的请求数据和返回数据都经过加密，其中请求数据经过两层加密：整个请求数据的`AES`加密和密码字段的`RSA`
公钥加密（密钥、公钥具体值见代码）。

加密前的请求数据结构如下：

```json5
{
  "areaCode": "xxx",
  "acctId": "xxx",
  "logonChan": "xxx",
  "credType": "xxx",
  "credentials": "xxx"  // <- encrypted with RSA
}
```

返回数据同样经过`AES`加密，密钥与请求数据相同。但返回值其中暂时不包含有用信息，验证状态码正常后可以直接忽略内容。

### Web端接口和App端接口

对于南网API相关信息的提取主要通过Web端的抓包和JS代码获取。
之后因为登录态有效期问题，对App端抓包进行比对后切换到App端API。
经过验证，Web端（网上营业厅）和App端（南网在线）的API接口基本相同，差别主要在于：

|              | Web                        | App                     |
|--------------|----------------------------|-------------------------|
| API路径        | ucs/ma/wt/                 | ucs/ma/zt/              |
| 支持登录方式       | 手机号+验证码（+密码），南网在线/微信/支付宝扫码 | 手机号+验证码（+密码），微信/支付宝跳转登录 |
| token有效期     | 几小时（有待进一步确认）               | 较长（有待进一步确认）                      |
| Cookies      | token包含在cookies中           | 无cookies                |
| 敏感信息（姓名、地址等） | 部分信息用“*”隐去                 | 有明文全文                   |

另外在HTTP请求头上有细微的差别（如：UA），但实际上对于请求的返回结果没有影响。

### API 实现库

本项目代码中的[`csg_client/__init__.py`](https://github.com/CubicPill/china_southern_power_grid_stat/blob/master/custom_components/china_southern_power_grid_stat/csg_client/__init__.py)
是对南网在线 App API 的实现，可以独立于此项目单独使用。
详细使用方法见`csg_client_demo.py`

## 2. 美的空调局域网发现地址修复

**现象**：集成能发现设备、云端登录也成功、token/key 正常返回，但添加时报 `Preset account login failed!`。

**根因**：部分路由器会中继/NAT 美的设备的 UDP 广播，导致发现的地址变成网关地址：

```
Cloud login success, account 17817******
Token and key for device 210006722454675 returned by cloud
connect device 210006722454675(192.168.31.1:6444) using method 1 token/key failed
connect device 210006722454675(192.168.31.1:6444) using method 2 token/key failed
```

`192.168.31.1` 是路由器，不是空调，所以连接必然失败；失败后插件回退到内置的共享账号（预置账号）取 token，而预置账号早已失效，于是报出上面那句误导性的错误。

**修复**：发现完成后按 MAC 从 `/proc/net/arp` 反查真实 IP，替换被改写过的地址。补丁见 [`patches/midea_ac_lan/discovery_arp_fix.patch`](patches/midea_ac_lan/discovery_arp_fix.patch)，应用说明见[该目录文档](patches/midea_ac_lan)。

## 3. HA 设备同步到巴法云（小爱同学语音控制）

把 HA 里的美的空调、抽油烟机等实体推到巴法云，再由米家绑定巴法、小爱语音控制。用的是官方自定义集成 **Bemfa Cloud**（`bemfa/bemfa_cloud_ha`，domain `bemfa_cloud`，方向 HA → 巴法云）。

前提是先搞清方向：`behome` 是巴法云 → HA，`bemfa_cloud` 才是 HA → 巴法云，两者可共存且不会回环。

完整步骤、topic 生成规则、重复设备迁移和限制说明见 [`docs/bemfa-cloud-sync.md`](docs/bemfa-cloud-sync.md)。

## 4. HA 2026.11 地图底图空白

**现象**：地图页只有「家」图钉和米色底色，没有街道、海岸线、地名；浏览器控制台报
`net::ERR_ABORTED /api/map_tiles/tilejson.json`。

**根因**：HA 2026.11 改为**服务端代理** OSM 矢量瓦片，上游是 `vector.openstreetmap.org`。
该域名在部分网络直连超时，`UPSTREAM_TIMEOUT = 10s` 后接口返回 502，前端拿不到 TileJSON 就不会请求任何瓦片。

**修复**：覆盖内置 `map_tiles`，在拉取上游时加 `proxy=` 参数（两行改动）。

```bash
cp -r custom_components/map_tiles /path/to/config/custom_components/
```

组件里 `MAP_TILES_PROXY` 默认 `http://192.168.31.1:7890`，换成自己的代理；diff 见 [`patches/map_tiles`](patches/map_tiles)。

修复前后：`tilejson.json` 从 `502 / 10.5s` 变成 `200 / 1.8KB / 0.01s`，矢量瓦片 `89KB`、栅格瓦片 `38KB` 均正常返回。

> 地图上只有「家」没有人的轨迹是另一件事：需要在 `person` 上关联带 GPS 的 `device_tracker`（HA 手机 App，定位权限设为“始终允许”）。

## 5. 60s 资讯接入 HA

把 [vikiboss/60s](https://github.com/vikiboss/60s) 全部接口接进 HA：本地容器 `vikiboss/60s`（端口 4399）做数据源，
`sixy.py` 分 8 组聚合，8 个 `command_line` 传感器承载，前端用自绘卡片展示，每天 07:30 推送企微。

关键点：

- 单组输出 1.3–10.1KB，避开 HA 状态属性 16KB 上限（此前知乎 48KB 直接被丢弃，页面空白）
- 文件缓存 + 公共 API 兜底 + 失败结果缓存 30 分钟，避免重复打上游
- 仪表盘 `.storage/lovelace_dashboards` 条目必须含 `url_path`，否则启动报 `KeyError: 'url_path'`，整站实体集体 unavailable

文件、部署步骤、分组与刷新频率见 [`dashboards/sixty-hub`](dashboards/sixty-hub)。

## 6. 自绘 3D 户型卡片

纯 Three.js 实现的 3D 户型：玻璃墙体、简化家具、地板分色、阴影、8 角点自动取景、双指/滚轮自由缩放（3.5–45）。

```yaml
type: custom:floor3d-card
height: 560
```

户型与家具数据写在 `floor3d-card.js` 顶部常量，单位与 `floorplan.png` 对齐。文件与交互说明见 [`dashboards/floor3d`](dashboards/floor3d)。

> 模块 URL 必须带版本号（`?v=5`），否则浏览器 31 天强缓存会让更新看不见；这是本卡片多次「配置错误」的真正原因。

## 7. 完整配置快照

[`config/`](config) 是当前 HA 实例的完整导出，可直接作为复刻起点：

| 内容 | 说明 |
|---|---|
| `configuration.yaml` | 全部集成配置：rest / command_line / template / shell_command / rest_command / frontend / lovelace / http |
| `automations.yaml` | 5 条自动化：小爱控制电视、净水器日报、设备开关通知、滤芯不足提醒、07:30 简报推送 |
| `scripts.yaml` / `scenes.yaml` | 脚本与场景 |
| `csg-dashboard.yaml` | 用电仪表盘（旧版 YAML 模式） |
| `scripts/*.py` | `sixy.py` 聚合、`wake_tv.py` 电视唤醒、`wecom_report_trigger.py`、`bemfa_send.py` |
| `www/` | 3D 卡片、60s 卡片、`floorplan.png` |
| `blueprints/` | 自动化蓝图 |
| `custom_components/` | map_tiles（含代理补丁）、xiaomi_home、midea_ac_lan、china_southern_power_grid_stat、bemfa_cloud、behome |
| `.storage/lovelace*` | 4 个仪表盘与资源清单（含 `url_path`） |

**未包含（有意排除）**：`secrets.yaml`、`.storage/auth*`、`.storage/core.*`、`home-assistant_v2.db*`、日志、`6s_cache`、`tts`、所有 `*.bak*`。

首次部署：

```bash
cp config/secrets.example.yaml config/secrets.yaml   # 填入企微 Webhook
docker compose -f deploy/docker-compose.yml up -d
```

`custom_components/` 内的第三方集成（xiaomi_home、midea_ac_lan 等）属于 HACS 组件，升级请走 HACS，不要直接改这里的副本。

## 8. 科技感首页与主题

- [`config/www/tech/tech-home.js`](config/www/tech/tech-home.js)：`custom:tech-home`，纯原生自绘。深空底 + 网格 + 扫描线 + 玻璃面板，包含电费统计、四个房间（气候/电视/风扇）、净水环形仪表、快捷入口；点击实体弹 more-info，点击芯片直接开关。
- [`config/themes/tech_dark.yaml`](config/themes/tech_dark.yaml)：赛博青暗色主题，通过 `frontend.themes` 加载。主题值必须全部是字符串，写成列表会报 `value should be a string at 'success-color'` 并导致整组主题加载失败。
- 启用方式：个人资料 → 主题 → `tech_dark`（每个浏览器保存一次）。也可调用 `frontend.set_theme` 全局临时生效，但重启后不持久。

设计参考（只借鉴思路，未引入依赖）：Mushroom 的磁贴与芯片、Bubble Card 的玻璃拟态、card-mod 的霓虹描边、ApexCharts 系的等宽数字与深色数据面板。

## Thank you
- [lyylyylyylyy](https://github.com/lyylyylyylyy): PR [#30](https://github.com/CubicPill/china_southern_power_grid_stat/pull/30) 短信验证码登录支持

感谢[瀚思彼岸](https://bbs.hassbian.com/)论坛以下帖子作者的辛苦付出，排名不分先后

- [不折腾，超简单接入电费数据](https://bbs.hassbian.com/thread-18474-1-1.html)
- [北京电费查询加强版](https://bbs.hassbian.com/thread-13820-1-1.html)
- [电费插件（Node-Red流）-广东南方电网](https://bbs.hassbian.com/thread-17830-1-1.html)
- [【抄作业】电费插件(NR流)-南网](https://bbs.hassbian.com/thread-18122-1-1.html)

自定义集成教程参考：[Building a Home Assistant Custom Component Part 1: Project Structure and Basics](https://aarongodfrey.dev/home%20automation/building_a_home_assistant_custom_component_part_1/)






