import json
import os
import random
import time

import requests

SERVER_NAME = os.getenv("SERVER_NAME", "server-01")
INTERVAL = int(os.getenv("INTERVAL_SECONDS", "5"))
API_URL = os.getenv("API_URL", "http://api:3000")


def make_stats():
    return {
        "server": SERVER_NAME,
        "cpu_percent": round(random.uniform(5, 95), 1),
        "memory_percent": round(random.uniform(20, 90), 1),
        "disk_percent": round(random.uniform(30, 95), 1),
    }


def send_stats(stats):
    try:
        response = requests.post(f"{API_URL}/stats", json=stats, timeout=5)
        print(f"sent {json.dumps(stats)} -> {response.status_code}", flush=True)
    except requests.RequestException as err:
        print(f"could not reach API: {err}", flush=True)


if __name__ == "__main__":
    print(f"Agent started for {SERVER_NAME}, reporting to {API_URL}", flush=True)
    while True:
        send_stats(make_stats())
        time.sleep(INTERVAL)