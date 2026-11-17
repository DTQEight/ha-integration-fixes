# map_tiles 代理补丁

覆盖式组件见 [`../../custom_components/map_tiles`](../../custom_components/map_tiles)，这里保留 diff，便于 HA 升级后重新套用。

## 应用方式

```bash
# 1. 用新版本内置组件重建覆盖目录
sudo docker cp homeassistant:/usr/src/homeassistant/homeassistant/components/map_tiles \
  /path/to/config/custom_components/map_tiles

# 2. 套用补丁
cd /path/to/config/custom_components
patch -p0 < /path/to/map_tiles_proxy.patch   # 或手动改 views.py
```

注意 `map_tiles_proxy.patch` 里的路径是容器内路径，直接 `patch` 时用 `-p1` 并对齐目录，或按下方 diff 手动加入两行。

## diff

```diff
@@ -43,6 +43,8 @@
 _LOGGER = logging.getLogger(__name__)
 
+MAP_TILES_PROXY: Final = "http://192.168.31.1:7890"
+
@@ -135,6 +137,7 @@
                 headers=UPSTREAM_HEADERS,
                 timeout=UPSTREAM_TIMEOUT,
                 auto_decompress=False,
+                proxy=MAP_TILES_PROXY,
             ) as response:
```

代理地址按需修改；`manifest.json` 需要补 `"version"` 字段。
