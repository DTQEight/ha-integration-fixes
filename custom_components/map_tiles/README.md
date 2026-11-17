# map_tiles（HA 2026.11 地图底图空白修复）

覆盖 HA 内置 `map_tiles` 组件，让服务端代理 OSM 矢量瓦片时走本地 HTTP 代理。

## 现象

HA 2026.11 的地图页面只有「家」图钉和米色底色，没有街道、海岸线、地名；其他功能正常。

浏览器控制台可看到：

```
net::ERR_ABORTED http://<HA>/api/map_tiles/tilejson.json
```

服务端直接访问该接口：

```
GET /api/map_tiles/tilejson.json  ->  HTTP 502  （约 10s 后返回）
```

## 根因

HA 2026.11 不再由浏览器直连 OSM，而是由 `map_tiles` 集成在服务端代理：

- 矢量瓦片上游：`https://vector.openstreetmap.org/shortbread_v1/tilejson.json`
- 栅格瓦片上游：`https://tile.openstreetmap.org`

这两块域名在部分网络（尤其国内）直连超时，`UPSTREAM_TIMEOUT = 10s` 到时返回 502，前端拿不到 TileJSON 就不会请求任何瓦片。

## 修复

`views.py` 中拉取上游时增加 `proxy=` 参数，共两行改动，见 [`../../patches/map_tiles/map_tiles_proxy.patch`](../../patches/map_tiles/map_tiles_proxy.patch)：

```python
MAP_TILES_PROXY: Final = "http://192.168.31.1:7890"

async with session.get(
    url,
    headers=UPSTREAM_HEADERS,
    timeout=UPSTREAM_TIMEOUT,
    auto_decompress=False,
    proxy=MAP_TILES_PROXY,
) as response:
```

**使用前把 `MAP_TILES_PROXY` 改成你自己的代理地址**；没有代理环境请勿使用本组件。

## 安装

```bash
cp -r custom_components/map_tiles /path/to/config/custom_components/
```

重启 HA。抄送的内置组件自带 `version` 字段，否则自定义组件会被判为无效清单。

## 验证

```bash
curl -s -o /dev/null -w '%{http_code} %{size_download}B %{time_total}s\n' \
  -H "Authorization: Bearer <token>" \
  http://<HA>/api/map_tiles/tilejson.json
```

修复前后对比：

| 接口 | 修复前 | 修复后 |
|---|---|---|
| `tilejson.json` | 502 / 10.5s | 200 / 1.8KB / 0.01s |
| `vector/12/3345/1784.mvt` | 502 / 11s | 200 / 89KB |
| `raster/12/3345/1784.png` | 502 / 11s | 200 / 38KB |

浏览器里可见街道、海岸线、地名即完成。

## 注意

- 这是**覆盖内核组件**，HA 升级后 `map_tiles` 实现若有变化，需要重新同步再打补丁；升级后地图再次空白就是这个原因。
- 若你的网络能直连上述两个域名，不需要本组件。
- 地图上只有「家」没有人的轨迹，与瓦片无关，需要在 `person` 上关联带 GPS 的 `device_tracker`（如 HA 手机 App）。
