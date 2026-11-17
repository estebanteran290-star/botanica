"""Genera out/SUBIDA_YOUTUBE.md con título, descripción (con capítulos), etiquetas
y programación sugerida para cada vídeo, a partir del manifiesto."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
m = json.load(open(f"{ROOT}/src/data/manifest.json"))
videos = {v["id"]: v for v in json.load(open(f"{ROOT}/content/videos.json"))}
fps = m["fps"]

# Hora de publicación sugerida (jueves 19/11/2026). Horario de España (CET) y México (CST).
SCHEDULE = {
    "v01": "Jueves 19 · 00:05 CET (miércoles 18, 17:05 CDMX) — o mejor aún, súbelo HOY como vídeo de calentamiento",
    "v03": "Jueves 19 · 08:00 CET (01:00 CDMX)",
    "v09": "Jueves 19 · 09:00 CET (02:00 CDMX)",
    "v02": "Jueves 19 · 10:00 CET (03:00 CDMX)",
    "v04": "Jueves 19 · 12:00 CET (05:00 CDMX)",
    "v05": "Jueves 19 · 14:00 CET (07:00 CDMX)",
    "v06": "Jueves 19 · 16:00 CET (09:00 CDMX)",
    "v07": "Jueves 19 · 18:00 CET (11:00 CDMX)",
    "v08": "Jueves 19 · 20:00 CET (13:00 CDMX)",
    "v10": "Jueves 19 · 22:00 CET (15:00 CDMX)",
}


def ts(frame):
    s = int(frame / fps)
    return f"{s // 60}:{s % 60:02d}"


out = ["# Paquete de subida a YouTube — canal MODO LEONIDA\n",
       "Todos los vídeos: 1920x1080, 30 fps, H.264 + AAC. Miniaturas 1280x720 JPG.\n\n",
       "Categoría: **Videojuegos** · Idioma: **Español** · Contenido creado de forma artificial/alterada: **Sí** (voz sintética) · Hecho para niños: **No**.\n\n",
       "\n## Orden recomendado de publicación\n"]
order = ["v01", "v03", "v09", "v02", "v04", "v05", "v06", "v07", "v08", "v10"]
for i, vid in enumerate(order, 1):
    v = next(x for x in m["videos"] if x["id"] == vid)
    out.append(f"{i}. **{v['title']}** — {SCHEDULE[vid]}\n")

for v in m["videos"]:
    src = videos[v["id"]]
    dur = v["durationInFrames"] / fps
    out.append(f"\n---\n\n## {v['id'].upper()} · `{v['id']}-{v['slug']}.mp4`  ({int(dur // 60)}:{int(dur % 60):02d})\n")
    out.append(f"**Miniatura:** `{v['id']}-{v['slug']}-miniatura.jpg`\n\n")
    out.append(f"**Título:**\n```\n{v['title']}\n```\n")
    first = src["scenes"][0]["narration"][0].replace("GTA seis", "GTA 6").replace("diecinueve de noviembre", "19 de noviembre")
    chapters = "\n".join(f"{ts(s['from'])} {s.get('chapter', '')}" for s in v["scenes"])
    desc = (
        f"{first}\n\n"
        f"📌 CAPÍTULOS\n{chapters}\n\n"
        "🔔 Suscríbete a MODO LEONIDA para tener todo GTA 6 en español: guías, mapa, personajes y noticias.\n\n"
        "ℹ️ Datos basados en la información pública disponible a 17/11/2026. Si Rockstar actualiza algo, lo verás fijado en comentarios.\n"
        "Canal de fans. No afiliado a Rockstar Games ni Take-Two Interactive. Grand Theft Auto es marca registrada de Take-Two Interactive.\n"
        "Voz generada con síntesis de voz (TTS). Música original del canal.\n\n"
        + " ".join("#" + t.replace(" ", "").replace("'", "") for t in src["tags"][:3])
    )
    out.append(f"**Descripción:**\n```\n{desc}\n```\n")
    out.append(f"**Etiquetas:**\n```\n{', '.join(src['tags'])}\n```\n")

os.makedirs(f"{ROOT}/out", exist_ok=True)
os.makedirs(f"{ROOT}/entregables", exist_ok=True)
open(f"{ROOT}/entregables/SUBIDA_YOUTUBE.md", "w").write("".join(out))
print("ok")
