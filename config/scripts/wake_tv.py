#!/usr/bin/env python3
"""通过 ADB 唤醒/待机电视。

用法:
  python wake_tv.py          # 唤醒: 电源键 + HOME（已在桌面则不动）
  python wake_tv.py sleep    # 待机: 电源键（已待机则不动）
  python wake_tv.py state    # 输出 STANDBY / AWAKE
  python wake_tv.py test     # 只测试连接
"""
import os
import sys
import time

from adb_shell.adb_device import AdbDeviceTcp
from adb_shell.auth.keygen import keygen
from adb_shell.auth.sign_pythonrsa import PythonRSASigner

HOST = os.environ.get("TV_ADB_HOST", "192.168.31.123")
PORT = int(os.environ.get("TV_ADB_PORT", "5555"))
KEY_PATH = os.environ.get("TV_ADB_KEY", "/config/.android/adbkey")


def get_signer():
    if not os.path.exists(KEY_PATH):
        os.makedirs(os.path.dirname(KEY_PATH), exist_ok=True)
        keygen(KEY_PATH)
    return PythonRSASigner.FromRSAKeyPath(KEY_PATH)


def connect():
    device = AdbDeviceTcp(HOST, PORT, default_transport_timeout_s=9.0)
    device.connect(rsa_keys=[get_signer()], auth_timeout_s=5.0)
    return device


def is_standby(device):
    """创维待机时前台是 com.tianci.system/.WakeLockActivity。"""
    try:
        focus = device.shell("dumpsys window | grep mCurrentFocus")
    except Exception:
        return False
    return "WakeLockActivity" in focus


def main():
    action = sys.argv[1] if len(sys.argv) > 1 else "wake"
    device = connect()
    standby = is_standby(device)

    if action == "test":
        print("ADB_OK standby=%s" % standby)
    elif action == "state":
        print("STANDBY" if standby else "AWAKE")
    elif action == "sleep":
        if standby:
            print("ALREADY_STANDBY")
        else:
            device.shell("input keyevent 26")
            print("SENT_SLEEP")
    else:
        if standby:
            device.shell("input keyevent 26")
            time.sleep(1.5)
            started = device.shell(
                "am start -n com.gathin.tvhome/.MainActivity"
            )
            if "Error" in started:
                device.shell("input keyevent 3")
            print("SENT_WAKE")
        else:
            print("ALREADY_AWAKE")

    device.close()


if __name__ == "__main__":
    main()
