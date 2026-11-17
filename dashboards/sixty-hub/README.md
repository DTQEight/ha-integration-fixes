# 60s 资讯终端（sixty-hub）

把 [vikiboss/60s](https://github.com/vikiboss/60s) 的全部接口搬进 HA：本地容器做数据源，一个 Python 脚本分 8 组聚合，8 个 `command_line` 传感器承载，前端用一个自绘卡片呈现。

## 组成

| 文件 | 作用 |
|---|---|
| `sixy.py` | 聚合脚本，放 `config/scripts/`，按组输出 `{group, updated, sections:[{k,n,items,err}]}` |
| `configuration-snippet.yaml` | `frontend.extra_module_url`、`rest`（简报/热搜/历史）、`command_line`（8 组） |
| `automations-snippet.yaml` | 每天 07:30 企微推送 4 条纯文本 |
| `card.js` | 自绘卡片 `custom:sixty-hub`，放 `config/www/60s/` |
| `dashboard.json` | 仪表盘 `60s 资讯` 的 `.storage/lovelace.sixty` 内容 |

## 部署

### 1. 本地 60s 容器

镜像 `vikiboss/60s` 内部端口 **4399**，`TZ=Asia/Shanghai`：

```bash
docker run -d --name sixty --restart unless-stopped \
  -p 4399:4399 -e TZ=Asia/Shanghai vikiboss/60s:latest
curl -s http://127.0.0.1:4399/v2/60s | head -c 120
```

HA 若为 `network_mode: host`，`sixy.py` 里的 `http://127.0.0.1:4399` 就指向宿主机；否则改成 NAS 实际 IP。

### 2. 脚本与实体

```bash
cp sixy.py /path/to/config/scripts/
```

把 `configuration-snippet.yaml` 的内容合并进 `configuration.yaml`，重启 HA。

### 3. 前端资源与仪表盘

```bash
mkdir -p /path/to/config/www/60s
cp card.js /path/to/config/www/60s/
```

`dashboard.json` 放到 `config/.storage/lovelace.sixty`，并在 `config/.storage/lovelace_dashboards` 增加一条：

```json
{"id":"sixty","title":"60s 资讯","icon":"mdi:newspaper-variant","show_in_sidebar":true,"require_admin":false,"mode":"storage","url_path":"sixty"}
```

> `url_path` 不能省。缺了它 HA 启动会报 `KeyError: 'url_path'`，lovelace / frontend / default_config 会连锁失败，表现为整站实体集体 unavailable。

## 分组与刷新频率

| 传感器 | 组 | 内容 | scan_interval |
|---|---|---|---|
| 六十秒资讯 | news | 今日简报 / IT 要闻 / IT 热榜 / AI 资讯 / HN / 前端面试题 | 1800 |
| 六十秒热搜A | hot_a | 微博 / 知乎 / B 站 / 抖音 / 头条 | 600 |
| 六十秒热搜B | hot_b | 百度 / 贴吧 / 剧集 / 夸克 / 小红书 / 懂车帝 | 1800 |
| 六十秒影视 | ent | 猫眼 / 豆瓣 / 网易云 / Epic / 歌词 | 3600 |
| 六十秒生活 | life | 天气 / 预报 / 农历 / 金价 / 汇率 / 油价 / 摸鱼 | 1800 |
| 六十秒趣闻 | fun | 必应壁纸 / 一言 / 段子 / 冷笑话 / KFC / 答案 / 百科 | 3600 |
| 六十秒历史 | hist | 历史上的今天 / 奥运 / 元素周期表 | 21600 |
| 六十秒工具 | tool | IP / WHOIS / 密码强度 / 颜色 / 翻译 / 哈希 / 健康 / 二维码 / OG | 21600 |

单组输出 1.3–10.1KB，低于 HA 状态属性 16KB 上限，因此不再出现知乎那种「属性被丢弃、页面上什么都没有」的问题。

## 容错

- 文件缓存目录 `config/6s_cache/`，按每接口 TTL 复用，避免重复打上游。
- 本地实例返回 5xx 时回退公共 API `https://60s.viki.moe`，失败结果再缓存 30 分钟，避免拖慢刷新。
- 上游确实失效的接口在卡片上显示 `LINK DOWN · HTTP 5xx`，不静默。

## 已知上游失效

`rednote`、`dongchedi`、`maoyan`（实时票房 / 剧集 / 网播 / 总榜）、`olympics` 奖牌榜、`beta/kuan`、`beta/qq/profile` 返回 500，公共 API 同样如此，属项目端问题。

## 注意

- 企微文本单条上限 2048 字节，简报拆成 4 条发送；Webhook 放 `secrets.yaml` 的 `wecom_webhook_url`。
- 卡片依赖实体 ID 与 `dashboard.json` 中 `channels[].entity` 一致；改中文名后 slug 会变，需要同步。
