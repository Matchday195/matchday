#!/usr/bin/env python3
"""Build world-clubs.json from the openfootball/clubs database (public domain, CC0).

Usage: python scripts/build_world_clubs.py /path/to/openfootball/clubs world-clubs.json
Each entry: [name, country]. Clubs already in the app's main list (data.js) are skipped.
"""
import json, os, re, sys, unicodedata

def norm(s):
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"\b(fc|cf|afc|sc|ac|cd|ss|ssc|as|sv|vfb|vfl|fk|sk|club|de|football|futbol|calcio|1\.)\b", " ", s)
    return re.sub(r"[^a-z0-9]+", "", s)

def main(src, out):
    here = os.path.dirname(os.path.abspath(__file__))
    data_js = open(os.path.join(here, "..", "data.js"), encoding="utf-8").read()
    known = set()
    for m in re.finditer(r'\["([^"]+)", "([^"]+)", "#[0-9A-Fa-f]{6}"(?:, "([^"]*)")?\]', data_js):
        known.add(norm(m.group(2)))
        for a in (m.group(3) or "").split("|"):
            if a: known.add(norm(a))
    clubs, seen = [], set()
    for root, _, files in os.walk(src):
        for f in sorted(files):
            if not f.endswith(".clubs.txt"):
                continue
            country = None
            for line in open(os.path.join(root, f), encoding="utf-8"):
                if country is None:
                    m = re.match(r"^=\s+(.+?)\s*$", line)
                    if m and not line.startswith("=="):
                        parts = [p.strip() for p in m.group(1).split("•")]
                        ascii_parts = [p for p in parts if p.isascii()]
                        country = (ascii_parts or parts)[0]  # "Österreich • Austria" -> "Austria"
                    continue
                if not line.strip() or line[0] in " \t#=|" or line.startswith("ii)") or line.startswith("iii)"):
                    continue
                name = line.split("#")[0].split(",")[0].strip()
                if not name or re.search(r"\(\d{4}", name) or len(name) < 2:
                    continue  # skip blanks and defunct clubs like "FC X (2000-2008)"
                key = norm(name)
                if not key or key in known or (key, country) in seen:
                    continue
                seen.add((key, country))
                clubs.append([name, country or "Unknown"])
    clubs.sort(key=lambda c: (c[1], c[0]))
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(clubs, fh, ensure_ascii=False, separators=(",", ":"))
    countries = sorted({c[1] for c in clubs})
    print(f"{len(clubs)} clubs from {len(countries)} countries -> {out}")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "world-clubs.json")
