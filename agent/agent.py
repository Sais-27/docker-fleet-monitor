import json
import os
import random
import time
from datetime import datetime, timezone

SERVER_NAME = os.getenv("SERVER_NAME", "server-01")
INTERVAL = int(os.getenv("INTERVAL_SECONDS", "5"))


def make_stats():
    return {
        "server": SERVER_NAME,
        "cpu_percent": round(random.uniform(5, 95), 1),
        "memory_percent": round(random.uniform(20, 90), 1),
        "disk_percent": round(random.uniform(30, 95), 1),
        "time": datetime.now(timezone.utc).isoformat(),
    }


if __name__ == "__main__":
    print(f"Agent started for {SERVER_NAME}", flush=True)
    while True:
        print(json.dumps(make_stats()), flush=True)
        time.sleep(INTERVAL)
