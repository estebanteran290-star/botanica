import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import "@fontsource/anton/400.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import { Background } from "./components/Background";
import { SceneSwitch } from "./components/Scenes";
import { CHANNEL_NAME, COLORS, FONT_BODY, FONT_DISPLAY } from "./brand";
import type { SceneData, Sentence, VideoData } from "./types";

const SceneWrap: React.FC<{ scene: SceneData; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const d = scene.durationInFrames;
  const inP = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const outP = interpolate(frame, [d - 8, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [0, d], [1, 1.03]);
  return (
    <AbsoluteFill style={{ opacity: Math.min(inP, outP), transform: `scale(${zoom})` }}>
      <SceneSwitch scene={scene} accent={accent} />
    </AbsoluteFill>
  );
};

// Divide una frase en bloques cortos para subtítulos estilo YouTube.
const chunk = (s: Sentence): { text: string; start: number; end: number }[] => {
  const words = s.text.split(/\s+/);
  const groups: string[] = [];
  let cur: string[] = [];
  for (const w of words) {
    cur.push(w);
    const len = cur.join(" ").length;
    if (len > 38 || (/[,.:;?!]$/.test(w) && len > 18)) {
      groups.push(cur.join(" "));
      cur = [];
    }
  }
  if (cur.length) groups.push(cur.join(" "));
  const total = groups.reduce((a, g) => a + g.length + 4, 0);
  const span = s.endFrame - s.startFrame;
  let t = s.startFrame;
  return groups.map((g) => {
    const dur = (span * (g.length + 4)) / total;
    const out = { text: g, start: Math.round(t), end: Math.round(t + dur) };
    t += dur;
    return out;
  });
};

const Captions: React.FC<{ scene: SceneData; accent: string }> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const chunks = scene.sentences.flatMap(chunk);
  const c = chunks.find((x, i) => frame >= x.start && frame < (chunks[i + 1]?.start ?? x.end + 8) && frame < x.end + 8);
  if (!c) return null;
  const p = interpolate(frame - c.start, [0, 4], [0.85, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 70 }}>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 900,
          fontSize: 52,
          color: "#fff",
          background: "rgba(0,0,0,0.78)",
          padding: "12px 30px",
          borderRadius: 14,
          borderBottom: `6px solid ${accent}`,
          maxWidth: 1500,
          textAlign: "center",
          transform: `scale(${p})`,
          textShadow: "2px 2px 0 #000",
        }}
      >
        {c.text}
      </div>
    </AbsoluteFill>
  );
};

const Hud: React.FC<{ video: VideoData }> = ({ video }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scene = [...video.scenes].reverse().find((s) => frame >= s.from);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 50,
          fontFamily: FONT_DISPLAY,
          fontSize: 34,
          letterSpacing: 4,
          color: "#fff",
          background: "rgba(0,0,0,0.5)",
          padding: "6px 18px",
          borderRadius: 10,
          borderLeft: `6px solid ${video.accent}`,
        }}
      >
        {CHANNEL_NAME}
      </div>
      {scene?.chapter && scene.type !== "title" && scene.type !== "outro" ? (
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 50,
            fontFamily: FONT_BODY,
            fontWeight: 800,
            fontSize: 28,
            color: COLORS.ink,
            background: "rgba(0,0,0,0.5)",
            padding: "8px 18px",
            borderRadius: 10,
          }}
        >
          {scene.chapter.toUpperCase()}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: video.accent, boxShadow: `0 0 16px ${video.accent}` }} />
    </AbsoluteFill>
  );
};

export const GtaVideo: React.FC<{ video: VideoData }> = ({ video }) => {
  return (
    <AbsoluteFill style={{ background: COLORS.bgTop }}>
      <Background accent={video.accent} />
      {video.scenes.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.durationInFrames} name={`${i + 1}. ${s.type} · ${s.chapter ?? ""}`}>
          <SceneWrap scene={s} accent={video.accent} />
          <Captions scene={s} accent={video.accent} />
        </Sequence>
      ))}
      <Hud video={video} />
      <Audio src={staticFile(video.audio)} />
    </AbsoluteFill>
  );
};
