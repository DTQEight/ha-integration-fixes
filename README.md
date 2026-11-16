# 自用 Home Assistant 集成修复

个人在真实环境里踩到、并且验证过修复效果的 HA 相关补丁合集。每条都写清楚**现象 → 根因 → 改了什么**，方便以后对照版本回查。

## 收录内容

| 目录 | 类型 | 内容 |
|---|---|---|
| [`custom_components/china_southern_power_grid_stat`](custom_components/china_southern_power_grid_stat) | 完整集成 | 南方电网电费集成，修复新版 HA 打开「配置」时的 `OptionsFlow` 崩溃 |
| [`patches/midea_ac_lan`](patches/midea_ac_lan) | 补丁 | 美的空调（Midea AC LAN）局域网发现地址被路由器改写成网关，导致添加设备失败 |
| [`dashboards/csg-dashboard.yaml`](dashboards/csg-dashboard.yaml) | 仪表盘 | 用电仪表盘，纯内置卡片，无前端依赖 |

安装方式：完整集成直接复制 `custom_components/<集成>` 到 HA 的 `config/custom_components/`；补丁按各自目录里的说明应用。

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

## Thank you
- [lyylyylyylyy](https://github.com/lyylyylyylyy): PR [#30](https://github.com/CubicPill/china_southern_power_grid_stat/pull/30) 短信验证码登录支持

感谢[瀚思彼岸](https://bbs.hassbian.com/)论坛以下帖子作者的辛苦付出，排名不分先后

- [不折腾，超简单接入电费数据](https://bbs.hassbian.com/thread-18474-1-1.html)
- [北京电费查询加强版](https://bbs.hassbian.com/thread-13820-1-1.html)
- [电费插件（Node-Red流）-广东南方电网](https://bbs.hassbian.com/thread-17830-1-1.html)
- [【抄作业】电费插件(NR流)-南网](https://bbs.hassbian.com/thread-18122-1-1.html)

自定义集成教程参考：[Building a Home Assistant Custom Component Part 1: Project Structure and Basics](https://aarongodfrey.dev/home%20automation/building_a_home_assistant_custom_component_part_1/)






