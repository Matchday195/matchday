#!/usr/bin/env python3
"""Decide whether the matches job should keep fetching every minute.

Exit code 0 = keep going (a match is live, or one kicks off within the next hour,
or one should have started but the free feed hasn't marked it live yet).
Exit code 1 = nothing on right now, the job can stop.
Usage: keep_going.py out/matches.json
"""
import json, sys
from datetime import datetime, timedelta, timezone

LIVE = {"IN_PLAY", "PAUSED", "LIVE", "SUSPENDED"}
NOT_STARTED = {"TIMED", "SCHEDULED"}


def main(path):
    try:
        matches = json.load(open(path, encoding="utf-8"))["matches"]
    except Exception:
        return 1
    now = datetime.now(timezone.utc)
    for m in matches:
        status = m.get("status")
        if status in LIVE:
            return 0
        if status in NOT_STARTED and m.get("utcDate"):
            try:
                ko = datetime.strptime(m["utcDate"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
            except ValueError:
                continue
            # Kicks off within the next hour, or kicked off in the last 2.5 hours
            # but the delayed free feed still says it hasn't started.
            if now - timedelta(minutes=150) <= ko <= now + timedelta(minutes=60):
                return 0
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "out/matches.json"))
