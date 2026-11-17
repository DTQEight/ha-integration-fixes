"""手动触发「企业微信-净水器日报」自动化。

用法（NAS 上）：
    echo <sudo密码> | sudo -S python3 /volume6/docker/homeassistant/config/scripts/wecom_report_trigger.py
"""

import base64
import hashlib
import hmac
import json
import time
import urllib.request

AUTH_PATH = "/volume6/docker/homeassistant/config/.storage/auth"
AUTOMATION_ENTITY = "automation.qi_ye_wei_xin_jing_shui_qi_ri_bao"


def b64(raw: bytes) -> bytes:
    return base64.urlsafe_b64encode(raw).rstrip(b"=")


def build_token(auth_path: str = AUTH_PATH) -> str:
    with open(auth_path, encoding="utf-8") as fh:
        data = json.load(fh)["data"]
    refresh = next(t for t in data["refresh_tokens"] if t.get("token_type") == "normal")
    header = b64(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload = b64(
        json.dumps(
            {"iss": refresh["id"], "iat": int(time.time()), "exp": int(time.time()) + 300}
        ).encode()
    )
    signing_input = header + b"." + payload
    signature = b64(hmac.new(refresh["jwt_key"].encode(), signing_input, hashlib.sha256).digest())
    return (signing_input + b"." + signature).decode()


def main() -> None:
    request = urllib.request.Request(
        "http://127.0.0.1:8123/api/services/automation/trigger",
        data=json.dumps({"entity_id": AUTOMATION_ENTITY}).encode(),
        headers={
            "Authorization": f"Bearer {build_token()}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            print("HTTP", response.status)
    except urllib.error.HTTPError as err:
        print("HTTP", err.code, err.read().decode()[:300])


if __name__ == "__main__":
    main()
