#!/usr/bin/env python3
"""Collect real football transfer headlines from public RSS feeds into news.json.

Runs on GitHub Actions every 30 minutes (see .github/workflows/news.yml).
Only headlines, source, time and link are saved — never article text — and the
app links people to the original article to read it.
"""
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape

FEEDS = [
    ("Sky Sports", "https://www.skysports.com/rss/11095", False),  # football news feed; filtered to transfer stories
    ("The Guardian", "https://www.theguardian.com/football/transfer-window/rss", True),  # transfer-window section
    ("The Guardian", "https://www.theguardian.com/football/rss", False),  # all football; filtered to transfer stories
]
TRANSFER_WORDS = re.compile(
    r"transfer|\bsign(s|ed|ing)?\b|\bdeal\b|\bloan|\bbids?\b|\bjoin(s|ed)?\b|\btarget|swoop|\bfee\b|contract|rumou?r|gossip|\bwindow\b|\bagree",
    re.I,
)
MAX_ITEMS = 60
MAX_AGE_DAYS = 90

# Team code -> words that identify the team in a headline. Read from the app's own team list in data.js.
def load_teams():
    import os
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data.js")
    text = open(path, encoding="utf-8").read()
    teams = {}
    for m in re.finditer(r'\["([^"]+)", "([^"]+)", "#[0-9A-Fa-f]{6}"(?:, "([^"]*)")?\]', text):
        key, name, aliases = m.group(1), m.group(2), m.group(3)
        teams[key] = [name] + (aliases.split("|") if aliases else [])
    return teams


TEAMS = load_teams()
# Names that are also everyday words or used for several teams: only match the longer aliases.
AMBIGUOUS = {"Nice", "Inter", "America", "América", "Santos", "Lens", "Atlas", "Remo", "Como", "Roma", "Parma", "Brest", "Lyon", "Monaco", "Celta"}


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Matchday195-news/1.0 (+https://github.com/Matchday195/matchday)"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()


def clean(text):
    text = unescape(re.sub(r"<[^>]+>", "", text or "")).strip()
    return re.sub(r"\s+", " ", text)


def teams_in(title):
    found = []
    for code, names in TEAMS.items():
        for n in names:
            if n in AMBIGUOUS and n not in ("Roma", "Lyon", "Monaco", "Parma", "Como", "Brest", "Lens", "Celta"):
                continue
            if re.search(r"(?<![A-Za-z])" + re.escape(n) + r"(?![A-Za-z])", title, re.I):
                found.append(code)
                break
    # "Inter Miami" is not Inter Milan
    if "INT" in found and re.search(r"Inter Miami", title, re.I) and not re.search(r"Inter Milan|Internazionale", title, re.I):
        found.remove("INT")
    return found


def parse(xml_bytes, source, transfer_feed):
    items = []
    root = ET.fromstring(xml_bytes)
    for it in root.iter("item"):
        title = clean(it.findtext("title"))
        link = (it.findtext("link") or "").strip()
        if not title or not link.startswith("http"):
            continue
        if not transfer_feed and not TRANSFER_WORDS.search(title):  # headline only: web addresses often say "transfer" on unrelated stories
            continue
        try:
            when = parsedate_to_datetime(it.findtext("pubDate")).astimezone(timezone.utc)
        except Exception:
            when = datetime.now(timezone.utc)
        if (datetime.now(timezone.utc) - when).days > MAX_AGE_DAYS:
            continue
        items.append({"title": title, "link": link, "source": source,
                      "published": when.strftime("%Y-%m-%dT%H:%M:%SZ"), "teams": teams_in(title)})
    return items


def main(out_path="news.json", local_files=None):
    all_items, sources_ok = [], []
    for i, (source, url, transfer_feed) in enumerate(FEEDS):
        try:
            data = open(local_files[i], "rb").read() if local_files and i < len(local_files) else fetch(url)
            got = parse(data, source, transfer_feed)
            all_items += got
            sources_ok.append(source)
            print(f"{source}: {len(got)} headlines")
        except Exception as e:  # one feed failing shouldn't stop the others
            print(f"{source}: failed ({e})", file=sys.stderr)
    if not sources_ok:
        print("No feeds worked; keeping the old news.json", file=sys.stderr)
        return 0
    seen, unique = set(), []
    for it in sorted(all_items, key=lambda x: x["published"], reverse=True):
        key = it["link"].split("?")[0]
        if key not in seen:
            seen.add(key)
            unique.append(it)
    out = {"updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "sources": sources_ok, "items": unique[:MAX_ITEMS]}
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"Saved {len(out['items'])} headlines to {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main(*(sys.argv[1:2] or []), local_files=sys.argv[2:] or None))
