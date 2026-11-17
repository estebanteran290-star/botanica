"""Genera la voz (Kokoro TTS), una música synthwave original y la mezcla final
de cada vídeo. Escribe:
  public/audio/<id>.mp3          pista final (voz + música + efectos)
  src/data/manifest.json         tiempos de escenas y frases (para subtítulos)

Uso:  python3 scripts/build_audio.py [v01 v02 ...]
Requiere: pip install kokoro-onnx soundfile scipy  y los modelos en /opt/tts
"""
import json
import math
import os
import re
import subprocess
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
SR = 48000
VOICE = os.environ.get("VOICE", "em_alex")
SPEED = float(os.environ.get("SPEED", "1.08"))
MODEL_DIR = os.environ.get("TTS_DIR", "/opt/tts")

# Pronunciación: el TTS lee en español, así que adaptamos nombres en inglés.
PRON = [
    (r"\bGTA plus\b", "ge te a plus"),
    (r"\bGTA\b", "ge te a"),
    (r"\bPlayStation\b", "Pléisteishon"),
    (r"\bXbox\b", "Ex box"),
    (r"\bSeries X y Series S\b", "Siries Ex y Siries Es"),
    (r"\bSeries X y S\b", "Siries Ex y Es"),
    (r"\bRockstar\b", "Rokstar"),
    (r"\bVice City Stories\b", "Vais Siti Stóris"),
    (r"\bVice City\b", "Vais Siti"),
    (r"\bLeonida Keys\b", "Leonida Kis"),
    (r"\bKeys\b", "Kis"),
    (r"\bGrassrivers\b", "Grasríver"),
    (r"\bPort Gellhorn\b", "Port Guélyorn"),
    (r"\bMount Kalaga\b", "Maunt Kalaga"),
    (r"\bEverglades\b", "Éverglades"),
    (r"\bOkeechobee\b", "Okichóbi"),
    (r"\bPanhandle\b", "Panjándel"),
    (r"\bPanama City\b", "Pánama Siti"),
    (r"\bUltimate\b", "Áltimeit"),
    (r"\bVintage\b", "Víntash"),
    (r"\bShore Court\b", "Shor Kort"),
    (r"\bVapid Stanier\b", "Vápid Stánier"),
    (r"\bJason Duval\b", "Yéison Duval"),
    (r"\bJason\b", "Yéison"),
    (r"\bCal Hampton\b", "Kal Jámpton"),
    (r"\bBoobie Ike\b", "Bubi Aik"),
    (r"\bBoobie\b", "Bubi"),
    (r"\bDre'Quan Priest\b", "Dricuán Prist"),
    (r"\bOnly Raw Records\b", "Onli Ro Récords"),
    (r"\bReal Dimez\b", "Ril Daims"),
    (r"\bBrian Heder\b", "Bráian Jéder"),
    (r"\bLori\b", "Lóri"),
    (r"\bGamesBeat\b", "Guéims Bit"),
    (r"\bRed Dead Redemption\b", "Red Ded Ridémshon"),
    (r"\bBonnie y Clyde\b", "Bóni y Cláid"),
    (r"\bDMA Design\b", "de eme a Disáin"),
    (r"\bLiberty City\b", "Líberti Siti"),
    (r"\bSan Andreas\b", "San Andrés"),
    (r"\bTommy Vercetti\b", "Tómi Verchéti"),
    (r"\bCJ\b", "Si Yei"),
    (r"\bNiko Bellic\b", "Níko Bélic"),
    (r"\bMichael, Franklin y Trevor\b", "Máikol, Fránklin y Trévor"),
    (r"\bYouTube\b", "Yutub"),
    (r"\bonline\b", "onlain"),
    (r"\bHDR\b", "hache de erre"),
    (r"\bHDMI\b", "hache de eme i"),
    (r"\bSSD\b", "ese ese de"),
    (r"\bUSB\b", "u ese be"),
    (r"\bPC\b", "pe ce"),
]


def pron(text):
    for pat, rep in PRON:
        text = re.sub(pat, rep, text)
    return text


_kokoro = None


def tts(text):
    global _kokoro
    if _kokoro is None:
        from kokoro_onnx import Kokoro

        _kokoro = Kokoro(f"{MODEL_DIR}/kokoro.onnx", f"{MODEL_DIR}/voices.bin")
    samples, sr = _kokoro.create(pron(text), voice=VOICE, speed=SPEED, lang="es")
    samples = np.asarray(samples, dtype=np.float32)
    # recorta silencios de los extremos
    thr = 0.01
    idx = np.where(np.abs(samples) > thr)[0]
    if len(idx):
        samples = samples[max(0, idx[0] - int(0.02 * sr)) : idx[-1] + int(0.06 * sr)]
    if sr != SR:
        g = math.gcd(sr, SR)
        samples = resample_poly(samples, SR // g, sr // g).astype(np.float32)
    return samples


# ---------------------------------------------------------------- música ---

def lowpass(x, cutoff, order=2):
    b, a = butter(order, cutoff / (SR / 2), btype="low")
    return lfilter(b, a, x)


def highpass(x, cutoff, order=2):
    b, a = butter(order, cutoff / (SR / 2), btype="high")
    return lfilter(b, a, x)


def saw(freq, n, detune=0.0):
    t = np.arange(n) / SR
    ph = (t * freq * (1 + detune)) % 1.0
    return 2 * ph - 1


def env_adsr(n, a=0.01, d=0.1, s=0.7, r=0.1):
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n)
    e[:na] = np.linspace(0, 1, na)
    nd = min(nd, n - na)
    e[na : na + nd] = np.linspace(1, s, nd)
    if nr < n:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def make_music(seconds, seed):
    rng = np.random.default_rng(seed)
    bpm = [96, 100, 104, 108][seed % 4]
    root = 57 + [0, 2, -2, 3, -4, 5, 1, -1, 4, -3][seed % 10]  # La menor transpuesto
    progs = [[0, -4, 3, -2], [0, -2, -4, -5], [0, 3, -4, -2], [0, -4, -2, -5]]
    prog = progs[seed % len(progs)]
    beat = 60.0 / bpm
    bar = beat * 4
    loop_bars = 8
    n_loop = int(bar * loop_bars * SR)
    pad = np.zeros(n_loop)
    bass = np.zeros(n_loop)
    arp = np.zeros(n_loop)
    drums = np.zeros(n_loop)

    for b in range(loop_bars):
        deg = prog[(b // 2) % 4]
        r = root + deg
        minor = deg in (0, -5, 3) if False else True
        chord = [r, r + (3 if deg in (0, -5) else 4), r + 7, r + 12]
        s0 = int(b * bar * SR)
        nb = int(bar * SR)
        # pad
        p = np.zeros(nb)
        for m in chord[:3]:
            f = midi(m)
            p += saw(f, nb, 0.004) + saw(f, nb, -0.004)
        p = lowpass(p, 1400) * env_adsr(nb, 0.25, 0.3, 0.8, 0.3) * 0.06
        pad[s0 : s0 + nb] += p
        # bajo en corcheas
        for k in range(8):
            ns = int(beat / 2 * SR)
            st = s0 + k * ns
            f = midi(r - 24)
            x = saw(f, ns) * env_adsr(ns, 0.005, 0.08, 0.5, 0.04)
            bass[st : st + ns] += lowpass(x, 500) * 0.22
        # arpegio en semicorcheas
        for k in range(16):
            ns = int(beat / 4 * SR)
            st = s0 + k * ns
            m = chord[[0, 1, 2, 3, 2, 1, 2, 3][k % 8]] + 12
            t = np.arange(ns) / SR
            x = np.sign(np.sin(2 * np.pi * midi(m) * t)) * env_adsr(ns, 0.002, 0.05, 0.2, 0.03)
            arp[st : st + ns] += lowpass(x, 2500) * 0.035
        # batería
        for k in range(4):
            st = s0 + int(k * beat * SR)
            nk = int(0.35 * SR)
            t = np.arange(nk) / SR
            if k in (0, 2):
                f = 50 + 90 * np.exp(-t * 30)
                kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
                drums[st : st + nk] += kick * 0.55
            else:
                sn = rng.standard_normal(nk) * np.exp(-t * 14)
                sn = highpass(sn, 900) * 0.18 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25) * 0.15
                drums[st : st + nk] += sn
            for h in range(2):
                hs = st + int(h * beat / 2 * SR)
                nh = int(0.06 * SR)
                hat = highpass(rng.standard_normal(nh), 7000) * np.exp(-np.arange(nh) / SR * 70) * 0.06
                drums[hs : hs + nh] += hat
    # eco en el arpegio
    d = int(beat * 0.75 * SR)
    echo = np.zeros_like(arp)
    echo[d:] = arp[:-d] * 0.35
    loop = pad + bass + arp + echo + drums
    reps = int(math.ceil(seconds * SR / n_loop)) + 1
    full = np.tile(loop, reps)[: int(seconds * SR)]
    # filtro de apertura (intro) y fade out
    n = len(full)
    fi = int(2.0 * SR)
    full[:fi] *= np.linspace(0, 1, fi)
    fo = int(3.0 * SR)
    full[-fo:] *= np.linspace(1, 0, fo)
    full /= np.max(np.abs(full)) + 1e-9
    return full.astype(np.float32)


def whoosh(seed):
    rng = np.random.default_rng(seed)
    n = int(0.55 * SR)
    t = np.linspace(0, 1, n)
    x = rng.standard_normal(n)
    # barrido de filtro simple por bloques
    out = np.zeros(n)
    blocks = 22
    bl = n // blocks
    for i in range(blocks):
        c = 300 + 5000 * math.sin(math.pi * i / blocks)
        seg = lowpass(x[i * bl : (i + 1) * bl], c, 1)
        out[i * bl : (i + 1) * bl] = seg
    out *= np.sin(np.pi * t) ** 2
    return (out / (np.max(np.abs(out)) + 1e-9) * 0.35).astype(np.float32)


def riser():
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    f = 200 + 900 * (t / t[-1]) ** 2
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / t[-1]) ** 2
    return (x * 0.18).astype(np.float32)


# ----------------------------------------------------------------- build ---

LEAD = 0.45  # silencio antes de hablar en cada escena (s)
GAP = 0.30  # pausa entre frases
TAIL = 0.65  # cola al final de escena
INTRO_EXTRA = 0.8  # primera escena: tiempo para el golpe de título


def build_video(v, index):
    voice_chunks = []
    scenes_out = []
    t = 0.0
    for si, sc in enumerate(v["scenes"]):
        start = t
        lead = LEAD + (INTRO_EXTRA if si == 0 else 0)
        cur = start + lead
        sentences = []
        for text in sc["narration"]:
            audio = tts(text)
            dur = len(audio) / SR
            voice_chunks.append((cur, audio))
            sentences.append({"text": text, "start": cur - start, "end": cur - start + dur})
            cur += dur + GAP
        cur = cur - GAP + TAIL
        if sc["type"] == "outro":
            cur += 2.5
        frames = int(math.ceil((cur - start) * FPS))
        scene_props = {k: val for k, val in sc.items() if k != "narration"}
        scenes_out.append(
            {
                **scene_props,
                "from": int(round(start * FPS)),
                "durationInFrames": frames,
                "sentences": [
                    {"text": s["text"], "startFrame": int(round(s["start"] * FPS)), "endFrame": int(round(s["end"] * FPS))}
                    for s in sentences
                ],
            }
        )
        t = (int(round(start * FPS)) + frames) / FPS
    total = t
    n = int(math.ceil(total * SR)) + SR
    voice = np.zeros(n, dtype=np.float32)
    for st, a in voice_chunks:
        i = int(st * SR)
        voice[i : i + len(a)] += a
    voice /= np.max(np.abs(voice)) + 1e-9
    voice *= 0.9

    music = make_music(n / SR + 1, index)[:n]
    # ducking: baja la música cuando habla la voz
    envv = np.abs(voice)
    win = int(0.25 * SR)
    envv = np.convolve(envv, np.ones(win) / win, mode="same")
    duck = np.where(envv > 0.01, 0.12, 0.30).astype(np.float32)
    duck = np.convolve(duck, np.ones(int(0.3 * SR)) / int(0.3 * SR), mode="same")
    mix = voice + music * duck

    sfx = np.zeros(n, dtype=np.float32)
    for k, sc in enumerate(scenes_out):
        if k == 0:
            r = riser()
            sfx[: len(r)] += r
            continue
        w = whoosh(index * 100 + k)
        i = max(0, int(sc["from"] / FPS * SR) - len(w) // 2)
        sfx[i : i + len(w)] += w[: n - i]
    mix += sfx
    mix = np.tanh(mix * 1.1) * 0.95

    os.makedirs(f"{ROOT}/public/audio", exist_ok=True)
    wav = f"/tmp/{v['id']}_mix.wav"
    sf.write(wav, mix[: int(total * SR)], SR)
    mp3 = f"{ROOT}/public/audio/{v['id']}.mp3"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
         "-ar", "48000", "-ac", "2", "-b:a", "192k", mp3],
        check=True,
    )
    os.remove(wav)
    return {
        "id": v["id"],
        "slug": v["slug"],
        "title": v["title"],
        "accent": v["accent"],
        "thumb": v["thumb"],
        "audio": f"audio/{v['id']}.mp3",
        "durationInFrames": int(round(total * FPS)),
        "scenes": scenes_out,
    }


def main():
    videos = json.load(open(f"{ROOT}/content/videos.json"))
    only = set(sys.argv[1:])
    man_path = f"{ROOT}/src/data/manifest.json"
    os.makedirs(os.path.dirname(man_path), exist_ok=True)
    manifest = {"fps": FPS, "videos": []}
    if os.path.exists(man_path):
        manifest = json.load(open(man_path))
    existing = {m["id"]: m for m in manifest["videos"]}
    for i, v in enumerate(videos):
        if only and v["id"] not in only:
            continue
        print("building", v["id"], flush=True)
        existing[v["id"]] = build_video(v, i)
        manifest["videos"] = [existing[x["id"]] for x in videos if x["id"] in existing]
        json.dump(manifest, open(man_path, "w"), ensure_ascii=False, indent=1)
        print("  ->", existing[v["id"]]["durationInFrames"] / FPS, "s", flush=True)


if __name__ == "__main__":
    main()
