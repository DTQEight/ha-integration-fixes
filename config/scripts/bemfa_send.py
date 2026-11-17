import json
import sys
import urllib.request

UID = "7e6495f611a742b0b72f450a542cb762"
TOPIC = "tv001"

msg = sys.argv[1] if len(sys.argv) > 1 else "on"
body = json.dumps({"uid": UID, "topic": TOPIC, "type": 1, "msg": msg}).encode()
req = urllib.request.Request(
    "https://apis.bemfa.com/va/postJsonMsg",
    data=body,
    headers={"Content-Type": "application/json; charset=utf-8"},
)
print(urllib.request.urlopen(req, timeout=8).read().decode())
