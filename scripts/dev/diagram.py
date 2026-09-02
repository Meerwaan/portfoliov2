"""Generates width-safe architecture diagrams (content/projects/<slug>/diagram.svg).
Boxes grow with their text (mono 11px ≈ 6.9px/char) so labels never overflow. Steps are drawn in order."""
import json, sys
CH = 6.9; PAD = 12; H = 64; FS = 11

def box(x, y, title, sub, signal=False):
    w = int(max(len(title), len(sub or "")) * CH + PAD * 2)
    return {"x": x, "y": y, "w": w, "h": H, "title": title, "sub": sub, "signal": signal}

def render(slug, title, desc, steps, width=960, height=300):
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="{slug}-t {slug}-d" fill="none" stroke="currentColor" stroke-width="1.25" font-family="var(--font-mono), ui-monospace, monospace" font-size="{FS}" letter-spacing="0.04em">',
           f'  <title id="{slug}-t">{title}</title>', f'  <desc id="{slug}-d">{desc}</desc>']
    for i, st in enumerate(steps, 1):
        out.append(f'  <g data-step="{i}">')
        for p in st.get("paths", []):
            out.append(f'    <path data-draw d="{p}"/>')
        b = st.get("box")
        if b:
            stroke = ' stroke="var(--signal)"' if b["signal"] else ""
            out.append(f'    <path data-draw{stroke} d="M{b["x"]} {b["y"]} H{b["x"]+b["w"]} V{b["y"]+b["h"]} H{b["x"]} Z"/>')
            fill = ' fill="var(--signal)"' if b["signal"] else ""
            out.append(f'    <g data-label fill="currentColor" stroke="none"><text x="{b["x"]+PAD}" y="{b["y"]+24}"{fill}>{b["title"]}</text>' + (f'<text x="{b["x"]+PAD}" y="{b["y"]+46}" opacity="0.6">{b["sub"]}</text>' if b["sub"] else "") + '</g>')
        for t in st.get("texts", []):
            out.append(f'    <g data-label fill="currentColor" stroke="none"><text x="{t[0]}" y="{t[1]}" opacity="0.6">{t[2]}</text></g>')
        out.append('  </g>')
    out.append('</svg>')
    return "\n".join(out) + "\n"

def chain(items, y=40, x0=20, gap=40):
    """Lay boxes on one row left to right with connectors; returns list of steps and the boxes."""
    steps, boxes, x = [], [], x0
    for i, it in enumerate(items):
        b = box(x, y, it[0], it[1], it[2] if len(it) > 2 else False)
        paths = [] if i == 0 else [f"M{x-gap} {y+H//2} H{x}"]
        steps.append({"paths": paths, "box": b}); boxes.append(b); x = b["x"] + b["w"] + gap
    return steps, boxes

D = {}
# Reputap
s, b = chain([("PLAQUE NFC", "/s/{token}"), ("SCAN_SESSION", "device · ip_hash · ttl"), ("AVIS GOOGLE", "review_intent")])
spin = box(b[2]["x"], 160, "POST /api/spin", "tirage serveur · poids · caps", True)
ticket = box(spin["x"] + spin["w"] + 40, 160, "TICKET", "ISSUED · code · expire")
caisse = box(b[1]["x"], 160, "CAISSE", "REDEEMED / REJECTED")
s += [{"paths": [f"M{b[2]['x']+b[2]['w']//2} 104 V160"], "box": spin},
      {"paths": [f"M{spin['x']+spin['w']} 192 H{ticket['x']}"], "box": ticket},
      {"paths": [f"M{ticket['x']+ticket['w']//2} 224 V264 H{caisse['x']+caisse['w']//2} V224"], "box": caisse}]
D["reputap"] = ("Flux Reputap : scan NFC, session, avis, tirage serveur, ticket, validation en caisse",
  "Une plaque NFC ouvre une URL à jeton. Le serveur crée une session de scan. Le client ouvre Google. Le serveur tire la roue et émet un ticket. Le commerçant valide ou rejette le ticket en caisse.", s, 1040)
# KastMe
s, b = chain([("VISITEUR", "kastme.fr/slug"), ("app/[slug] · SSR + ISR", "revalidate 3600 · 404 si absent", True), ("FIRESTORE", "portfolios · slugs · users"), ("ÉDITEUR", "PATCH /api/portfolios/[id] · Zod")])
storage = box(b[2]["x"], 160, "CLOUD STORAGE", "images 10 Mo · vidéos 50 Mo")
og = box(b[1]["x"], 160, "opengraph-image", "générée depuis les médias")
s += [{"paths": [f"M{b[2]['x']+b[2]['w']//2} 104 V160"], "box": storage},
      {"paths": [f"M{b[1]['x']+b[1]['w']//2} 104 V160"], "box": og},
      {"paths": [f"M{b[3]['x']+b[3]['w']//2} 104 V264 H{b[0]['x']+b[0]['w']//2} V104"], "texts": [(b[1]["x"], 258, "revalidation de la page publique après sauvegarde")]}]
D["kastme"] = ("Architecture KastMe : page publique SSR + ISR, Firestore, Storage, image OG, éditeur",
  "Un visiteur ouvre kastme.fr/slug. Le serveur rend la page et la met en cache par ISR, lit le portfolio dans Firestore et les médias dans Cloud Storage, et génère l'image de partage. L'éditeur sauvegarde via l'API validée par Zod et revalide la page.", s, 1180)
# Neocortex
s, b = chain([("PRATICIEN", "poste du cabinet"), ("ELECTRON · renderer", "dossier · passation · bilan"), ("API EXPRESS", "JWT · bcrypt · rôles", True), ("SEQUELIZE", "PostgreSQL · SQLite en dev")])
routes = box(b[2]["x"], 160, "ROUTES", "/auth · /users · /admin")
pdf = box(b[1]["x"], 160, "BILAN → PDF", "composé depuis les résultats")
s += [{"paths": [f"M{b[2]['x']+b[2]['w']//2} 104 V160"], "box": routes}, {"paths": [f"M{b[1]['x']+b[1]['w']//2} 104 V160"], "box": pdf}]
D["neocortex"] = ("Architecture Neocortex : application Electron, API Express avec rôles, Sequelize, PostgreSQL, bilan PDF",
  "Le praticien utilise une application de bureau Electron. Elle parle à une API Express protégée par jetons signés et middleware de rôles. Sequelize porte le modèle vers PostgreSQL en production et SQLite en développement. Le parcours va du dossier patient à la passation puis au bilan exporté en PDF.", s, 1000)
# Capsule
s, b = chain([("MARQUE", "configurateur 6 étapes"), ("QUOTE · PENDING", "POST /api/quote · fichiers privés"), ("ATELIER · chiffrage", "PRICED → compte client créé", True)])
pay = box(b[2]["x"], 160, "MARQUE · paiement", "PAID → PROJECT + SHIPMENT")
prod = box(pay["x"] + pay["w"] + 40, 160, "PRODUCTION · 9 étapes", "coupe · couture · qualité · envoi")
s += [{"paths": [f"M{b[2]['x']+b[2]['w']//2} 104 V160"], "box": pay},
      {"paths": [f"M{pay['x']+pay['w']} 192 H{prod['x']}"], "box": prod},
      {"paths": [f"M{prod['x']+prod['w']//2} 224 V264 H{b[0]['x']+b[0]['w']//2} V104"], "texts": [(b[1]["x"], 258, "la marque suit la même timeline, adresse modifiable tant que rien n'est expédié")]}]
D["capsule"] = ("Flux Capsule : configurateur, devis, chiffrage par l'atelier, paiement de la marque, projet et suivi de production",
  "La marque remplit le configurateur, le devis est persisté avec ses fichiers techniques privés. L'atelier chiffre le devis, ce qui crée le compte client. La marque paie, ce qui crée le projet et son expédition. L'atelier fait avancer les neuf étapes de production, visibles côté marque.", s, 1060)

for slug, (t, d, steps, w) in D.items():
    open(f"content/projects/{slug}/diagram.svg", "w").write(render(slug, t, d, steps, width=w))
    print("wrote", slug, "width", w)
