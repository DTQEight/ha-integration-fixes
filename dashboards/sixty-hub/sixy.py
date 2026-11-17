"""Fetch every 60s endpoint locally, trim the payloads, print compact JSON for HA."""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = 'http://127.0.0.1:4399/'
PUB = 'https://60s.viki.moe/'
LAN = 'http://192.168.31.52:4399/'
CACHE = '/config/6s_cache'
Q = urllib.parse.quote

# key: (path, title, ttl seconds)
GROUPS = {
    'news': [
        ('60s', 'v2/60s', '今日简报', 1800),
        ('60s-rss', 'v2/60s/rss', 'RSS 订阅', 86400),
        ('it-news', 'v2/it-news', 'IT 要闻', 1800),
        ('it-rank', 'v2/it-news/rank', 'IT 热榜', 1800),
        ('ai-news', 'v2/ai-news', 'AI 资讯', 21600),
        ('hacker', 'v2/hacker-news/top', 'Hacker News 热榜', 1800),
        ('hn-new', 'v2/hacker-news/new', 'Hacker News 最新', 1800),
        ('hn-best', 'v2/hacker-news/best', 'Hacker News 精选', 1800),
        ('awesome-js', 'v2/awesome-js', '前端面试题', 86400),
    ],
    'hot_a': [
        ('weibo', 'v2/weibo', '微博热搜', 600),
        ('zhihu', 'v2/zhihu', '知乎热榜', 900),
        ('bili', 'v2/bili', 'B 站热搜', 900),
        ('douyin', 'v2/douyin', '抖音热点', 900),
        ('toutiao', 'v2/toutiao', '头条热榜', 900),
    ],
    'hot_b': [
        ('baidu-hot', 'v2/baidu/hot', '百度热搜', 600),
        ('baidu-rt', 'v2/baidu/realtime', '百度实时热点', 600),
        ('tieba', 'v2/baidu/tieba', '贴吧热议', 1800),
        ('teleplay', 'v2/baidu/teleplay', '百度电视剧', 3600),
        ('quark', 'v2/quark', '夸克热搜', 1800),
        ('rednote', 'v2/rednote', '小红书热点', 1800),
        ('dongchedi', 'v2/dongchedi', '懂车帝热榜', 3600),
    ],
    'ent': [
        ('maoyan-movie', 'v2/maoyan/realtime/movie', '猫眼实时票房', 1800),
        ('maoyan-tv', 'v2/maoyan/realtime/tv', '猫眼剧集热度', 1800),
        ('maoyan-web', 'v2/maoyan/realtime/web', '猫眼网播热度', 1800),
        ('maoyan-all', 'v2/maoyan/all/movie', '猫眼票房总榜', 21600),
        ('douban-movie', 'v2/douban/weekly/movie', '豆瓣口碑电影', 21600),
        ('douban-tv-cn', 'v2/douban/weekly/tv_chinese', '豆瓣国产剧', 21600),
        ('douban-tv-gl', 'v2/douban/weekly/tv_global', '豆瓣英美剧', 21600),
        ('douban-show-cn', 'v2/douban/weekly/show_chinese', '豆瓣综艺', 21600),
        ('douban-show-gl', 'v2/douban/weekly/show_global', '豆瓣海外综艺', 21600),
        ('ncm', 'v2/ncm-rank/list', '网易云榜单', 21600),
        ('ncm-id', 'v2/ncm-rank/19723756', '网易云飙升榜', 21600),
        ('epic', 'v2/epic', 'Epic 免费游戏', 21600),
        ('lyric', 'v2/lyric?query=' + Q('晴天'), '歌词', 86400),
    ],
    'life': [
        ('weather', 'v2/weather?query=' + Q('深圳'), '深圳天气', 1800),
        ('forecast', 'v2/weather/forecast?query=' + Q('深圳'), '天气预报', 3600),
        ('lunar', 'v2/lunar', '农历', 21600),
        ('gold', 'v2/gold-price', '金价', 21600),
        ('fx', 'v2/exchange-rate', '汇率', 21600),
        ('fuel', 'v2/fuel-price?province=' + Q('广东'), '油价', 21600),
        ('moyu', 'v2/moyu', '摸鱼日历', 21600),
    ],
    'fun': [
        ('bing', 'v2/bing', '必应壁纸', 21600),
        ('hitokoto', 'v2/hitokoto', '一言', 3600),
        ('duanzi', 'v2/duanzi', '段子', 3600),
        ('dad-joke', 'v2/dad-joke', '冷笑话', 3600),
        ('kfc', 'v2/kfc', '疯狂星期四', 21600),
        ('changya', 'v2/changya', '唱鸭', 3600),
        ('luck', 'v2/luck', '今日运势', 21600),
        ('fabing', 'v2/fabing', '发病语录', 3600),
        ('answer', 'v2/answer', '脑筋急转弯', 3600),
        ('baike', 'v2/baike?word=' + Q('深圳'), '百科', 21600),
    ],
    'hist': [
        ('history', 'v2/today-in-history', '历史上的今天', 21600),
        ('olympics', 'v2/olympics', '奥运奖牌榜', 21600),
        ('olympics-events', 'v2/olympics/events', '奥运赛事', 86400),
        ('chemical', 'v2/chemical', '元素周期表', 86400),
    ],
    'tool': [
        ('ip', 'v2/ip', 'IP 归属', 21600),
        ('whois', 'v2/whois?domain=github.com', 'WHOIS', 86400),
        ('password', 'v2/password', '随机密码', 3600),
        ('pwd-check', 'v2/password/check?password=abc123', '密码强度', 86400),
        ('color', 'v2/color/random', '随机颜色', 3600),
        ('palette', 'v2/color/palette?hex=ff8800', '配色卡', 86400),
        ('fanyi', 'v2/fanyi?text=hello', '翻译', 86400),
        ('langs', 'v2/fanyi/langs', '翻译语言', 86400),
        ('hash', 'v2/hash?content=abc&type=md5', 'Hash', 86400),
        ('health', 'v2/health?height=175&weight=70&gender=male&age=30', 'BMI', 86400),
        ('og', 'v2/og?url=' + Q('https://github.com'), '网页信息', 86400),
        ('qrcode', 'v2/qrcode?text=hello', '二维码', 86400),
        ('kuan', 'v2/beta/kuan', '宽弹幕', 86400),
        ('qq-profile', 'v2/beta/qq/profile?qq=10001', 'QQ 资料', 86400),
    ],
}


def cache_path(key, url):
    safe = url.replace('http://', '').replace('/', '_').replace('?', '_').replace('=', '_').replace('&', '_')
    return os.path.join(CACHE, key + '_' + safe[:80] + '.json')


def special(key):
    """Endpoints that are not JSON: hand HA a addressable link / image."""
    if key == 'qrcode':
        return [{'t': '扫码打开 hello', 'img': LAN + 'v2/qrcode?text=hello'}]
    if key == '60s-rss':
        return [{'t': 'RSS 订阅地址（点击打开）', 'l': LAN + 'v2/60s/rss'}]
    return None


def _load(base, url, timeout):
    req = urllib.request.Request(base + url, headers={'User-Agent': 'Mozilla/5.0 sixy'})
    return json.loads(urllib.request.urlopen(req, timeout=timeout).read())['data']


def fetch(key, url, ttl):
    os.makedirs(CACHE, exist_ok=True)
    fp = cache_path(key, url)
    efp = fp + '.err'
    if os.path.exists(efp) and time.time() - os.path.getmtime(efp) < 1800:
        raise RuntimeError(open(efp, encoding='utf-8').read()[:40])
    if os.path.exists(fp) and time.time() - os.path.getmtime(fp) < ttl:
        try:
            cached = json.load(open(fp, encoding='utf-8'))
            if not (isinstance(cached, dict) and cached.get('error')):
                return cached
        except Exception:
            pass
    errs = []
    for base, timeout in ((BASE, 12), (PUB, 10)):
        try:
            payload = _load(base, url, timeout)
            if isinstance(payload, dict) and payload.get('error'):
                raise RuntimeError('upstream: %s' % payload['error'])
            with open(fp, 'w', encoding='utf-8') as fh:
                json.dump(payload, fh, ensure_ascii=False)
            if os.path.exists(efp):
                os.remove(efp)
            return payload
        except urllib.error.HTTPError as exc:
            errs.append('HTTP %s' % exc.code)
        except Exception as exc:  # noqa: BLE001
            errs.append(str(exc)[:24])
    msg = ' / '.join(errs)
    with open(efp, 'w', encoding='utf-8') as fh:
        fh.write(msg)
    raise RuntimeError(msg)


def s(v, n=42):
    return (' ' + str(v).strip()).strip()[:n] if v not in (None, '') else ''


def brief(payload, key):
    """Turn any payload into [{t,l,x,img}] rows."""
    if key == 'ai-news' and isinstance(payload, dict):
        return [{'t': s(x.get('title'), 46)} for x in (payload.get('news') or [])[:10]]
    if key == 'langs' and isinstance(payload, list):
        return [{'t': '共 %d 种语言' % len(payload)},
                {'t': '、'.join([s(x.get('label'), 10) for x in payload[:12]])}]
    if key == 'ncm' and isinstance(payload, list):
        return [{'t': s(x.get('name'), 20), 'x': s(x.get('update_frequency'), 12)} for x in payload[:8]]
    if key == 'ncm-id' and isinstance(payload, list):
        rows = []
        for x in payload[:10]:
            art = '、'.join([a.get('name', '') for a in (x.get('artist') or [])][:2])
            rows.append({'t': '%s. %s' % (x.get('rank'), s(x.get('title'), 20)), 'x': s(art, 12)})
        return rows
    if key == 'olympics-events' and isinstance(payload, list):
        rows = []
        for x in payload[:10]:
            row = {'t': '%s %s' % (s(x.get('year'), 4), s(x.get('name'), 20))}
            if x.get('url'):
                row['l'] = x['url']
            rows.append(row)
        return rows
    if isinstance(payload, list):
        rows = []
        for it in payload[:10]:
            if isinstance(it, str):
                rows.append({'t': s(it, 90)})
                continue
            t = it.get('title') or it.get('name') or it.get('question') or it.get('hitokoto') or ''
            if not t:
                t = it.get('desc') or it.get('content') or it.get('duanzi') or it.get('saying') or ''
            row = {'t': s(t, 46)}
            link = it.get('link') or it.get('url') or ''
            if link:
                row['l'] = link
            extra = (it.get('hot_value_desc') or it.get('original_price_desc') or it.get('score_desc')
                     or it.get('rating') or it.get('hot_value') or '')
            if extra:
                row['x'] = s(extra, 16)
            rows.append(row)
        return rows

    if isinstance(payload, dict):
        if 'news' in payload:
            rows = []
            for n in payload['news'][:15]:
                rows.append({'t': s(n.get('title'), 88) if isinstance(n, dict) else s(n, 90)})
            return rows
        if 'items' in payload and isinstance(payload['items'], list):
            return [{'t': s(it.get('title') or it.get('year') or '', 60),
                     'x': s(it.get('year') or '', 6)} if isinstance(it, dict) else {'t': s(it, 90)}
                    for it in payload['items'][:8]]
        if key == 'weather':
            w = payload.get('weather') or {}
            aq = payload.get('air_quality') or {}
            return [{'t': '%s %s°C 湿度%s%% %s%s级' % (
                s(w.get('condition'), 8), w.get('temperature', ''), w.get('humidity', ''),
                s(w.get('wind_direction'), 4), w.get('wind_power', ''))},
                {'t': '空气质量 %s %s' % (s(aq.get('aqi'), 4), s(aq.get('quality'), 6))}]
        if key == 'forecast':
            return [{'t': '%s %s %s~%s°C %s' % (
                s(d.get('date'), 10), s(d.get('day_condition'), 6),
                d.get('min_temperature', ''), d.get('max_temperature', ''),
                s(d.get('air_quality'), 4))} for d in (payload.get('daily_forecast') or [])[:6]]
        if key == 'lunar':
            lu = payload.get('lunar') or {}
            stage = (payload.get('term') or {}).get('stage') or {}
            fest = payload.get('festival') or {}
            return [{'t': s(lu.get('desc_short'), 40)},
                    {'t': '节气 %s' % s(stage.get('name'), 10)},
                    {'t': '节日 %s' % (s(fest.get('both_desc') or fest.get('lunar') or fest.get('solar'), 20) or '无')}]
        if key == 'gold':
            return [{'t': s(m.get('name'), 10) + ' ' + s(m.get('today_price'), 8) + s(m.get('unit'), 6)}
                    for m in (payload.get('metals') or [])[:4]]
        if key == 'fx':
            want = ['USD', 'EUR', 'JPY', 'HKD', 'GBP', 'KRW']
            return [{'t': '1 元 = %s %s' % (r.get('rate'), r.get('currency'))}
                    for r in payload.get('rates') or [] if r.get('currency') in want]
        if key == 'fuel':
            if payload.get('error'):
                return [{'t': '接口返回：' + s(payload['error'], 40)}]
            rows = []
            if payload.get('region'):
                rows.append({'t': '地区 %s' % s(payload['region'], 10)})
            for it in (payload.get('items') or [])[:6]:
                rows.append({'t': '%s %s 元' % (s(it.get('name'), 12), it.get('price', ''))})
            return rows
        if key == 'moyu':
            d = payload.get('date') or {}
            lu = d.get('lunar') or {}
            rows = [{'t': '%s %s 农历%s%s' % (d.get('gregorian', ''), d.get('weekday', ''),
                                             lu.get('monthCN', ''), lu.get('dayCN', ''))}]
            q = payload.get('moyuQuote')
            if isinstance(q, dict):
                q = q.get('content') or q.get('text') or ''
            if q:
                rows.append({'t': s(q, 60)})
            nh = payload.get('nextHoliday') or {}
            if nh:
                rows.append({'t': '下个假期 %s 还有 %s 天' % (s(nh.get('name'), 12), nh.get('countdown', ''))})
            return rows
        if key in ('hitokoto', 'duanzi', 'dad-joke', 'kfc', 'fabing'):
            field = {'hitokoto': 'hitokoto', 'duanzi': 'duanzi', 'dad-joke': 'content',
                     'kfc': 'kfc', 'fabing': 'saying'}[key]
            return [{'t': s(payload.get(field), 90)}]
        if key == 'answer':
            return [{'t': s(payload.get('answer'), 40)}, {'t': s(payload.get('answer_en'), 40)}]
        if key == 'awesome-js':
            rows = [{'t': s(payload.get('question'), 46), 'x': '#' + str(payload.get('id', ''))}]
            for line in (payload.get('code') or '').strip().splitlines()[:3]:
                if line.strip():
                    rows.append({'t': s(line, 50)})
            return rows
        if key == 'chemical':
            if not (payload.get('name') or payload.get('mass')):
                return [{'t': '上游返回空记录（项目已知问题）'}]
            return [{'t': '%s %s %s' % (s(payload.get('name'), 10), s(payload.get('formula'), 10),
                                        s(payload.get('mass'), 10))}]
        if key == 'fanyi':
            src = payload.get('source') or {}
            tgt = payload.get('target') or {}
            return [{'t': '%s → %s' % (s(src.get('text'), 24), s(tgt.get('text'), 46))},
                    {'t': '%s → %s' % (s(src.get('type_desc'), 8), s(tgt.get('type_desc'), 8))}]
        if key == 'langs':
            return [{'t': '共 %d 种语言' % len(payload)},
                    {'t': '、'.join([s(x.get('label'), 10) for x in payload[:12]])}]
        if key == 'hash':
            sha = payload.get('sha') or {}
            return [{'t': 'MD5 ' + s(payload.get('md5'), 32)},
                    {'t': 'SHA1 ' + s(sha.get('sha1'), 32)},
                    {'t': 'SHA256 ' + s(sha.get('sha256'), 32)}]
        if key == 'health':
            b = payload.get('bmi') or {}
            return [{'t': 'BMI %s · %s' % (b.get('value', ''), s(b.get('category'), 10))},
                    {'t': s(b.get('evaluation'), 40)},
                    {'t': s((payload.get('basic_info') or {}).get('height'), 8) + ' / '
                            + s((payload.get('basic_info') or {}).get('weight'), 8) + ' / '
                            + s((payload.get('basic_info') or {}).get('age'), 8)}]
        if key == 'pwd-check':
            return [{'t': '密码 %s' % s(payload.get('password'), 20)},
                    {'t': '强度 %s（%s 分）' % (s(payload.get('strength'), 6), payload.get('score', ''))},
                    {'t': '预估破解 %s' % s(payload.get('time_to_crack'), 18)}]
        if key == 'palette':
            inp = payload.get('input') or {}
            rows = [{'t': '输入 %s · %s' % (s(inp.get('hex'), 8), s(inp.get('name'), 10))}]
            for p in (payload.get('palettes') or [])[:4]:
                rows.append({'t': '%s：%s' % (s(p.get('name'), 10),
                                              ' '.join([c.get('hex', '') for c in (p.get('colors') or [])[:4]]))})
            return rows
        if key == 'changya':
            song = payload.get('song') or {}
            user = payload.get('user') or {}
            rows = [{'t': '%s - %s' % (s(song.get('name'), 16), s(song.get('singer'), 12))},
                    {'t': '来自 %s' % s(user.get('nickname'), 20)}]
            for line in (song.get('lyrics') or [])[:4]:
                rows.append({'t': s(line, 40)})
            return rows
        if key == 'og':
            return [{'t': '标题：' + s(payload.get('title'), 40)},
                    {'t': '描述：' + s(payload.get('description'), 50)}]
        if key in ('ip', 'whois', 'password', 'color', 'bing', 'hitokoto', 'duanzi', 'dad-joke',
                   'kfc', 'luck', 'fabing', 'answer', 'baike', 'lyric', 'epic'):
            rows = []
            for k, v in payload.items():
                if len(rows) >= 8:
                    break
                if isinstance(v, (str, int, float, bool)) and str(v).strip():
                    rows.append({'t': '%s：%s' % (k, s(v, 44))})
            return rows
        return [{'t': '%s：%s' % (k, s(v, 40))} for k, v in list(payload.items())[:8]
                if isinstance(v, (str, int, float))]
    return []


def main():
    group = sys.argv[1] if len(sys.argv) > 1 else 'news'
    sections = []
    for key, url, title, ttl in GROUPS.get(group, []):
        fixed = special(key)
        if fixed is not None:
            sections.append({'k': key, 'n': title, 'items': fixed})
            continue
        try:
            payload = fetch(key, url, ttl)
            sec = {'k': key, 'n': title, 'items': brief(payload, key)}
        except urllib.error.HTTPError as exc:
            sec = {'k': key, 'n': title, 'items': [], 'err': 'HTTP %s' % exc.code}
        except Exception as exc:  # noqa: BLE001
            sec = {'k': key, 'n': title, 'items': [], 'err': str(exc)[:40]}
        sections.append(sec)
        time.sleep(0.3)
    print(json.dumps({'group': group, 'updated': time.strftime('%m-%d %H:%M'),
                      'sections': sections}, ensure_ascii=False))


if __name__ == '__main__':
    main()
