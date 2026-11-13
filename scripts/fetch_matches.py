#!/usr/bin/env python3
"""Fetch real fixtures, scores and league tables from football-data.org (free plan).

Runs on GitHub Actions (see .github/workflows/matches.yml). The API token comes from the
FOOTBALL_DATA_TOKEN repository secret and is never written to any file.
Writes into the output folder:
  matches.json    matches from about 2 weeks ago to 2 weeks ahead, all free-plan competitions
  standings.json  league tables (refreshed at most once an hour)
  season.json     every match of the current season for each competition (refreshed every 6 hours)
  status.json     whether the last run worked (no secrets inside), for troubleshooting
Free plan limit is 10 calls per minute, so calls are spaced 7 seconds apart.
"""
import json, os, sys, time, urllib.request, urllib.error
from datetime import datetime, timedelta, timezone

API = os.environ.get("FD_API", "https://api.football-data.org/v4")  # override only for local testing
LEAGUE_CODES = ["PL", "PD", "SA", "BL1", "FL1", "DED", "PPL", "ELC", "BSA"]  # tables; codes not on the plan are skipped
SEASON_CODES = LEAGUE_CODES + ["CL"]  # whole-season fixtures, one call each
calls = 0


def get(path, token):
    global calls
    if calls:
        time.sleep(float(os.environ.get("FD_SLEEP", "7")))
    calls += 1
    req = urllib.request.Request(API + path, headers={"X-Auth-Token": token, "User-Agent": "Matchday195/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def team(t):
    return {"id": t.get("id"), "name": t.get("name") or "", "short": t.get("shortName") or t.get("name") or "", "tla": t.get("tla") or ""}


def slim(m, comp=None):
    s = m.get("score") or {}
    ft, ht = s.get("fullTime") or {}, s.get("halfTime") or {}
    c = m.get("competition") or comp or {}
    return {"id": m["id"], "comp": c.get("code"), "compName": c.get("name"), "utcDate": m.get("utcDate"),
            "status": m.get("status"), "minute": m.get("minute"), "matchday": m.get("matchday"), "stage": m.get("stage"),
            "home": team(m.get("homeTeam") or {}), "away": team(m.get("awayTeam") or {}),
            "hs": ft.get("home"), "as": ft.get("away"), "hht": ht.get("home"), "aht": ht.get("away")}


def write(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))


def main(out, quick=False):
    os.makedirs(out, exist_ok=True)
    now = datetime.now(timezone.utc)
    stamp = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    token = os.environ.get("FOOTBALL_DATA_TOKEN", "").strip()
    status = {"updated": stamp, "ok": False, "calls": 0, "error": None, "matches": 0, "tables": 0}
    if not token:
        status["error"] = "FOOTBALL_DATA_TOKEN secret is not set"
        write(os.path.join(out, "status.json"), status)
        print(status["error"])
        return 0
    try:
        today = now.date()
        matches = {}
        mp = os.path.join(out, "matches.json")
        windows = ((-13, -4), (-3, 6), (7, 16))
        if quick:
            # Every-minute update: keep what we have and refresh only yesterday..tomorrow (1 call).
            try:
                for m in json.load(open(mp, encoding="utf-8"))["matches"]:
                    matches[m["id"]] = m
                windows = ((-1, 1),)
            except Exception:
                matches = {}  # nothing saved yet: do a full fetch
        # The API allows up to 10 days per request.
        for a, b in windows:
            d1, d2 = today + timedelta(days=a), today + timedelta(days=b)
            data = get(f"/matches?dateFrom={d1}&dateTo={d2}", token)
            for m in data.get("matches", []):
                matches[m["id"]] = slim(m)
        items = sorted(matches.values(), key=lambda m: (m["utcDate"] or "", m["id"]))
        write(mp, {"updated": stamp, "matches": items})
        status["matches"] = len(items)

        # League tables: refresh at most once an hour.
        sp = os.path.join(out, "standings.json")
        old = None
        try:
            old = json.load(open(sp, encoding="utf-8"))
        except Exception:
            pass
        fresh = old and (now - datetime.strptime(old["updated"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)) < timedelta(minutes=60)
        if fresh or quick:
            status["tables"] = len((old or {}).get("tables", {}))
        else:
            tables = dict((old or {}).get("tables", {}))
            for code in LEAGUE_CODES:
                try:
                    data = get(f"/competitions/{code}/standings", token)
                except urllib.error.HTTPError as e:
                    if e.code in (403, 404):
                        continue  # not on the free plan
                    raise
                total = next((s for s in data.get("standings", []) if s.get("type") == "TOTAL"), None)
                if not total:
                    continue
                tables[code] = {"name": (data.get("competition") or {}).get("name"), "season": (data.get("season") or {}).get("startDate"),
                                "rows": [{"pos": r["position"], "team": team(r["team"]), "p": r["playedGames"], "w": r["won"], "d": r["draw"],
                                          "l": r["lost"], "gd": r["goalDifference"], "pts": r["points"]} for r in total.get("table", [])]}
            write(sp, {"updated": stamp, "tables": tables})
            status["tables"] = len(tables)

        # Whole season, every competition: refresh every 6 hours (the minute updates cover live games).
        zp = os.path.join(out, "season.json")
        old = None
        try:
            old = json.load(open(zp, encoding="utf-8"))
        except Exception:
            pass
        fresh = old and (now - datetime.strptime(old["updated"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)) < timedelta(hours=6)
        if fresh or quick:
            status["season"] = len((old or {}).get("matches", []))
        else:
            season = {m["id"]: m for m in (old or {}).get("matches", [])}
            for code in SEASON_CODES:
                try:
                    data = get(f"/competitions/{code}/matches", token)
                except urllib.error.HTTPError as e:
                    if e.code in (403, 404):
                        continue  # not on the free plan
                    raise
                for m in data.get("matches", []):
                    season[m["id"]] = slim(m, data.get("competition"))
            items = sorted(season.values(), key=lambda m: (m["utcDate"] or "", m["id"]))
            write(zp, {"updated": stamp, "matches": items})
            status["season"] = len(items)
        status["ok"] = True
    except urllib.error.HTTPError as e:
        status["error"] = f"HTTP {e.code} from football-data.org" + (" (check the token)" if e.code in (400, 401, 403) else "")
    except Exception as e:  # keep the old data; just report the problem
        status["error"] = f"{type(e).__name__}: {e}"[:200]
    status["calls"] = calls
    write(os.path.join(out, "status.json"), status)
    print(json.dumps(status))
    return 0


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    sys.exit(main(args[0] if args else "data", quick="--quick" in sys.argv))
