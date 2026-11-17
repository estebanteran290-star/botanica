# MODO LEONIDA — canal de GTA 6 en español (Remotion)

10 vídeos listos para YouTube para el lanzamiento de GTA 6 (jueves 19/11/2026):
guion, voz, música original, animaciones, subtítulos quemados, montaje y miniaturas.
Proyecto creado con `npx create-video` (Remotion).

| # | Vídeo | Búsqueda que ataca |
|---|-------|--------------------|
| 01 | ¿A qué hora sale GTA 6? | hora de salida, precarga, parche día 1 |
| 02 | ¿Cuánto cuesta GTA 6? | precio, ediciones, bonus de reserva |
| 03 | ¿GTA 6 está en español? | doblaje, subtítulos, idioma |
| 04 | El mapa de GTA 6 | mapa, regiones de Leonida |
| 05 | Jason y Lucía | protagonistas, historia |
| 06 | Todos los personajes | personajes secundarios |
| 07 | ¿GTA 6 sale en PC? | PC, Steam, requisitos |
| 08 | ¿Hay GTA 6 Online? | online, multijugador |
| 09 | Prepara tu consola | cuánto pesa, espacio, ajustes |
| 10 | La historia de GTA | saga GTA, todos los GTA |

## Estructura

- `content/videos.json` — **guiones** (narración por frases) y datos visuales de cada escena. Edita aquí.
- `scripts/build_audio.py` — voz (Kokoro TTS, voz `em_alex`), música synthwave generada por código, efectos y mezcla → `public/audio/*.mp3` + `src/data/manifest.json` (tiempos de cada frase).
- `src/` — composiciones Remotion: fondo animado, 11 tipos de escena, subtítulos, HUD y miniaturas.
- `scripts/render_all.mjs` — renderiza MP4 + miniaturas en `out/`.
- `scripts/youtube_meta.py` — genera `out/SUBIDA_YOUTUBE.md` (títulos, descripciones con capítulos, etiquetas, horario).

## Regenerar

```bash
npm install
pip install kokoro-onnx soundfile scipy
# modelos: kokoro-v1.0.onnx y voices-v1.0.bin (github.com/thewh1teagle/kokoro-onnx releases) en /opt/tts
python3 scripts/build_audio.py          # o solo algunos: v01 v03
npm run dev                             # previsualizar en Remotion Studio
node scripts/render_all.mjs             # render final
python3 scripts/youtube_meta.py
```

Cambiar el nombre del canal: `src/brand.ts`. Cambiar voz: `VOICE=ef_dora python3 scripts/build_audio.py` (voz femenina).

## Notas legales

Todo el material visual (fondos, mapa esquemático, iconos) y la música son originales y generados por código; no se usa
arte, logos, capturas ni música de Rockstar. Es un canal de fans y lo indica en cada vídeo. Datos verificados con
fuentes públicas a 17/11/2026: si algo cambia el día del lanzamiento, edita `content/videos.json` y vuelve a generar.
