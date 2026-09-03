"""Generates content/about/stack-diagram.svg from content/about/stack.json.
Rows are years, columns are layers; each year is one drawing step (boxes of that year plus the links
that connect them to earlier boxes). Boxes grow with their text (mono 11px ≈ 6.9px/char)."""
import json
CH = 6.9; PAD = 10; H = 30; GAP = 8; FS = 11
COL_GAP = 30; ROW_GAP = 40; LEFT = 176; TOP = 46

data = json.load(open("content/about/stack.json"))
cols = [c["id"] for c in data["columns"]]
years = [y["year"] for y in data["years"]]
where = {y["year"]: y["where"] for y in data["years"]}
nodes = data["nodes"]
for n in nodes:
    n["w"] = int(len(n["name"]) * CH + PAD * 2)

def cell(col, year):
    return [n for n in nodes if n["col"] == col and n["year"] == year]

# Column widths: the widest pair when a cell stacks in two sub-columns, else the widest box.
colw = {}
for c in cols:
    w = 60
    for y in years:
        items = cell(c, y)
        if len(items) > 2:
            ws = sorted((n["w"] for n in items), reverse=True)
            w = max(w, ws[0] + ws[1] + GAP)
        elif items:
            w = max(w, max(n["w"] for n in items))
    colw[c] = w
colx = {}
x = LEFT
for c in cols:
    colx[c] = x
    x += colw[c] + COL_GAP
WIDTH = x - COL_GAP + 16

# Row heights and node positions.
rowy = {}
y = TOP
for yr in years:
    rows = 1
    for c in cols:
        items = cell(c, yr)
        per = 2 if len(items) > 2 else 1
        rows = max(rows, -(-len(items) // per))
    rowy[yr] = y
    for c in cols:
        items = cell(c, yr)
        per = 2 if len(items) > 2 else 1
        for i, n in enumerate(items):
            r, k = divmod(i, per)
            n["x"] = colx[c] + (0 if k == 0 else items[i - 1]["w"] + GAP if per == 2 and k == 1 else 0)
            if per == 2 and k == 1:
                n["x"] = colx[c] + max(m["w"] for m in items[0::2]) + GAP
            n["y"] = y + r * (H + GAP)
    y += rows * (H + GAP) - GAP + ROW_GAP
HEIGHT = y - ROW_GAP + 12
by = {n["name"]: n for n in nodes}

def side(n):
    """Which gutter a box uses: left for the first sub-column, right for the second."""
    return "right" if n["x"] > colx[n["col"]] else "left"

def gutter(n):
    c = n["col"]
    return colx[c] + colw[c] + 10 if side(n) == "right" else colx[c] - 10

def port(n):
    return n["x"] + n["w"] if side(n) == "right" else n["x"]

def edge(a, b):
    """Orthogonal path from earlier box a to later box b. Neighbours connect directly; everything else leaves
    by a column gutter, runs in the gap above the target row and enters by the target's gutter, so no link
    ever crosses a box."""
    ay, by_ = a["y"] + H / 2, b["y"] + H / 2
    same_row = a["year"] == b["year"]
    if same_row and abs(a["y"] - b["y"]) < 1:
        left, right = (a, b) if a["x"] < b["x"] else (b, a)
        blocked = any(n is not a and n is not b and n["year"] == a["year"] and abs(n["y"] - a["y"]) < 1 and left["x"] < n["x"] < right["x"] for n in nodes)
        if not blocked:
            return f"M{left['x']+left['w']} {ay:.0f} H{right['x']}"
    if same_row and abs(a["x"] - b["x"]) < 1:
        top, bottom = (a, b) if a["y"] < b["y"] else (b, a)
        return f"M{top['x']+top['w']/2:.0f} {top['y']+H} V{bottom['y']}"
    g = rowy[b["year"]] - ROW_GAP / 2
    return f"M{port(a)} {ay:.0f} H{gutter(a)} V{g:.0f} H{gutter(b)} V{by_:.0f} H{port(b)}"

TITLES = {
    "fr": ("Ma stack, comme une architecture : chaque outil à son année, relié à ce qu'il a rejoint",
           "Lignes par année de 2020 à 2026, colonnes par couche : langages, web et desktop, mobile, serveur, données, infra, automatisation, IA et média. Les liens relient chaque outil à ceux qu'il prolonge."),
    "en": ("My stack as an architecture: each tool at its year, linked to what it joined",
           "Rows per year from 2020 to 2026, columns per layer: languages, web and desktop, mobile, server, data, infra, automation, AI and media. Links connect each tool to the ones it extends."),
}
for loc, (title, desc) in TITLES.items():
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-labelledby="stack-t stack-d" fill="none" stroke="currentColor" stroke-width="1.25" font-family="var(--font-mono), ui-monospace, monospace" font-size="{FS}" letter-spacing="0.04em">',
           f'  <title id="stack-t">{title}</title>', f'  <desc id="stack-d">{desc}</desc>',
           '  <g fill="currentColor" stroke="none" opacity="0.7" font-weight="700">']
    for c in data["columns"]:
        out.append(f'    <text x="{colx[c["id"]]}" y="20">{c["label"][loc].upper()}</text>')
    out.append('  </g>')
    for i, yr in enumerate(years, 1):
        out.append(f'  <g data-step="{i}">')
        out.append(f'    <g data-label data-year fill="currentColor" stroke="none"><text x="0" y="{rowy[yr]+20}" font-weight="700">{yr}</text><text x="0" y="{rowy[yr]+36}" opacity="0.6">{where[yr][loc]}</text></g>')
        for n in [n for n in nodes if n["year"] == yr]:
            for src in n.get("from", []):
                out.append(f'    <path data-draw data-link="{src}|{n["name"]}" opacity="0.45" d="{edge(by[src], n)}"/>')
        for n in [n for n in nodes if n["year"] == yr]:
            stroke = ' stroke="var(--signal)"' if n.get("core") else ""
            fill = ' fill="var(--signal)"' if n.get("core") else ""
            out.append(f'    <g data-node="{n["name"]}" tabindex="0">')
            out.append(f'      <path data-draw{stroke} d="M{n["x"]} {n["y"]} H{n["x"]+n["w"]} V{n["y"]+H} H{n["x"]} Z"/>')
            out.append(f'      <g data-label fill="currentColor" stroke="none"><text x="{n["x"]+PAD}" y="{n["y"]+20}"{fill}>{n["name"]}</text></g>')
            out.append('    </g>')
        out.append('  </g>')
    out.append('</svg>')
    open(f"content/about/stack-diagram.{loc}.svg", "w").write("\n".join(out) + "\n")
    print("wrote", f"content/about/stack-diagram.{loc}.svg", WIDTH, HEIGHT)
