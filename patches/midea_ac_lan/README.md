# 美的空调（midea_ac_lan）局域网发现地址修复

## 问题

在某些路由器环境下（例如小米路由器的 IoT 网络/广播中继），美的设备的 UDP 广播应答会被改写成网关地址。插件按该地址连接，必然失败：

```
DEBUG [midealan.discover] Found a supported device: {'device_id': 210006722454675, ..., 'ip_address': '192.168.31.1', 'port': 6444, 'mac': '9cc12d9d5c7d'}
DEBUG [midealan.cloud]  get_cloud_keys() returned 1 token entries      # token 其实拿到了
DEBUG [midealan.device] [210006722454675] Connecting to 192.168.31.1:6444
DEBUG [midealan.device] [210006722454675] Connection error
DEBUG [custom_components.midea_ac_lan.config_flow] connect device using method 1 token/key failed
DEBUG [custom_components.midea_ac_lan.config_flow] connect device using method 2 token/key failed
DEBUG [custom_components.midea_ac_lan.config_flow] Unable to connect device with all the token/key
```

因为设备连接失败，插件回退到内置的“预置账号”取 token，这些共享账号早已失效，界面最终显示：

```
Preset account login failed!
```

这个报错具有很强的误导性——**它和账号密码无关**。

## 修复内容

在 `config_flow.py` 中新增两个函数，并在每次 `discover()` 之后校正设备地址：

- `_arp_lookup(mac)`：读取 `/proc/net/arp`，按 MAC 返回真实 IP（比较前统一去掉冒号并转小写，因为发现结果里是 `9cc12d9d5c7d`，系统 ARP 表里是 `9c:c1:2d:9d:5c:7d`）
- `_apply_arp_addresses(devices)`：把发现结果里的 `ip_address` 换成 ARP 表中的地址

## 应用方法

适用于 `midea_ac_lan` 2026.10.0（其他版本如果上下文一致也能打上）：

```bash
cd /path/to/config
cp -r custom_components/midea_ac_lan custom_components/midea_ac_lan.bak
patch -p1 < discovery_arp_fix.patch
# 重启 Home Assistant
```

如果 `patch` 提示上下文不匹配，说明上游版本已变动，可以手动把 `_arp_lookup` / `_apply_arp_addresses` 两个函数复制进 `config_flow.py`，并在 `discover()` 调用之后加一行 `_apply_arp_addresses(self.devices)`。

## 验证

打补丁后重新添加设备，日志里应出现：

```
DEBUG [custom_components.midea_ac_lan.config_flow] Device 210006722454675 discovered at 192.168.31.1, using ARP address 192.168.31.183
```

并且 `Connecting to` 后面是真实 IP，添加即可成功。

> 注意：集成升级会覆盖 `config_flow.py`，升级后需重新打补丁。
