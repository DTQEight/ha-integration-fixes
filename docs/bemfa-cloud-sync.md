# HA 设备同步到巴法云（Bemfa Cloud）

目标：把 Home Assistant 里的设备（美的空调、抽油烟机等）推送到巴法云，再由米家/小爱同学语音控制。

**方向说明（很容易搞反）**

| 集成 | 方向 | 作用 |
|---|---|---|
| `bemfa_cloud`（Bemfa Cloud） | HA → 巴法云 | 选中 HA 实体后，巴法云生成对应设备，状态回传，小爱可控制 |
| `behome`（BeHome） | 巴法云 → HA | 把巴法云设备导入 HA 当实体 |

两个可以同时装。`bemfa_cloud` 会自动跳过 `behome` 创建的实体，避免重复同步和控制回环。

## 1. 安装

上游仓库：<https://github.com/bemfa/bemfa_cloud_ha>（自定义集成，domain `bemfa_cloud`）。

HA 容器连不上 GitHub 时，在宿主机下载再拷进配置目录：

```bash
cd /tmp
curl -sL -o bemfa_cloud.zip https://codeload.github.com/bemfa/bemfa_cloud_ha/zip/refs/heads/main
python3 -c "import zipfile; zipfile.ZipFile('bemfa_cloud.zip').extractall('.')"
cp -r bemfa_cloud_ha-main/custom_components/bemfa_cloud <HA配置目录>/custom_components/
# 重启 HA
```

本次部署环境：HA 2026.11.1（Docker）、`bemfa_cloud` v0.1.20、配置目录 `/volume6/docker/homeassistant/config`。

## 2. 配置

1. 设置 → 设备与服务 → 添加集成 → 搜 **Bemfa Cloud**
2. 选 **私钥**，填巴法云控制台左上角的私钥（uid）
3. 在「选择同步设备」里勾选要同步的实体 → 提交

选择建议：

- 空调（`climate`）勾选
- 风扇（`fan`，抽油烟机）勾选
- **自动化不要勾**（例如「小爱同学控制电视」是 `automation` 实体，勾了只会在米家里多出一个没意义的开关）
- 已经通过巴法云 `tv001` 接入米家的电视，不需要再同步

## 3. 米家端

米家 App → 我的 → 添加其他平台 → 添加 → 搜索「巴法」→ 账号绑定 → 登录后点 **同步设备**。

以后 HA 新增了同步设备，要回到这里再点一次「同步设备」，小爱才能识别。

## 4. 主题（topic）生成规则

集成按实体 ID 生成固定 topic，格式：

```
hass + md5(稳定ID)前12位 + 3位类型后缀
```

类型后缀：`001` 插座、`002` 灯、`003` 风扇、`004` 传感器、`005` 空调、`006` 开关、`009` 窗帘。

因为 topic 由实体决定，改实体 ID 会在巴法云新建一台设备；改昵称/房间则是同步更新，不会重复建。

> 旧版社区集成（如 `larry-wong/bemfa`）用的是**完整 32 位 md5**，因此升级到官方 Bemfa Cloud 后，历史设备会和新设备同名并存。迁移时到巴法云控制台删掉旧 topic 即可，否则米家里会出现两套同名空调。本次迁移删除的旧主题：
>
> ```
> hass57ec2632c1c91ee8f3b622b2b63e6c4c005   书房空调
> hass4328c5674c226b7f5e3a41cc1b37ac59005   客厅空调
> hass9e3b6f1e3a48361bddda4ee4271039c8005   次卧空调
> hass3e980c55c957025c67957446b3257014003   抽油烟机
> ```

## 5. 能力与限制

- 空调：支持开关、模式、温度、风速（按 HA 支持的模式自动匹配）
- 风扇：支持开关、档位
- 传感器：巴法云传感器类型只承载温度、湿度、开关状态，TDS、滤芯寿命这类数据同步不过去
- 净水器：巴法云没有对应设备类型。若需要小爱开关机，先在美的集成「配置 → 开关」里启用 `Power`，再把它当普通开关同步
- 自定义集成不随 HA 升级自动更新；升级 HA 后需确认同步是否正常

## 6. 更新

```bash
# 覆盖更新后重启 HA
cp -r bemfa_cloud_ha-main/custom_components/bemfa_cloud <HA配置目录>/custom_components/
```

不建议用自动化调用 `update.install` 自动更新自定义集成：HA 版本变更可能带来 breaking change，出问题时会影响已经在用的设备。
