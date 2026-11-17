import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { CHANNEL_NAME, COLORS, DISCLAIMER, FONT_BODY, FONT_DISPLAY } from "../brand";
import type { SceneData } from "../types";
import { Chip, Heading, Panel, revealFrames, useSpring } from "./ui";
import { LeonidaMap } from "./LeonidaMap";

type P = { scene: SceneData; accent: string };

const Area: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ padding: "130px 150px 230px 150px", ...style }}>{children}</AbsoluteFill>
);

const Pop: React.FC<{ at: number; children: React.ReactNode; from?: "left" | "bottom" | "right" | "scale"; style?: React.CSSProperties }> = ({
  at,
  children,
  from = "left",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 140 } });
  const tx = from === "left" ? (1 - p) * -120 : from === "right" ? (1 - p) * 120 : 0;
  const ty = from === "bottom" ? (1 - p) * 80 : 0;
  const sc = from === "scale" ? 0.6 + 0.4 * p : 1;
  return (
    <div style={{ opacity: Math.min(1, p * 1.4), transform: `translate(${tx}px, ${ty}px) scale(${sc})`, ...style }}>
      {children}
    </div>
  );
};

// ----------------------------------------------------------------- TITLE
export const TitleScene: React.FC<P> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const words = (scene.title ?? "").split(" ");
  const sweep = interpolate(frame, [10, 50], [-30, 130], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const sub = useSpring(16 + words.length * 4);
  const kick = useSpring(2);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 140 }}>
      <div style={{ transform: `scale(${0.7 + 0.3 * kick})`, opacity: kick, marginBottom: 30 }}>
        <Chip text={scene.kicker ?? ""} accent={accent} />
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1600,
          gap: "0 34px",
          position: "relative",
        }}
      >
        {words.map((w, i) => (
          <Word key={i} word={w} i={i} accent={accent} />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(100deg, transparent ${sweep - 12}%, rgba(255,255,255,0.55) ${sweep}%, transparent ${sweep + 12}%)`,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />
      </div>
      <div
        style={{
          marginTop: 34,
          fontFamily: FONT_BODY,
          fontWeight: 800,
          fontSize: 46,
          color: COLORS.ink,
          background: "rgba(0,0,0,0.55)",
          padding: "12px 34px",
          borderRadius: 14,
          borderLeft: `10px solid ${accent}`,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 30}px)`,
        }}
      >
        {scene.subtitle}
      </div>
    </AbsoluteFill>
  );
};

const Word: React.FC<{ word: string; i: number; accent: string }> = ({ word, i, accent }) => {
  const p = useSpring(6 + i * 4, { damping: 10, stiffness: 160, mass: 0.7 });
  const isGta = /GTA|6/.test(word);
  return (
    <span
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 150,
        lineHeight: 1.05,
        color: isGta ? accent : COLORS.ink,
        textShadow: `0 0 40px ${accent}, 6px 6px 0 #000`,
        WebkitTextStroke: isGta ? "3px #fff" : undefined,
        display: "inline-block",
        transform: `translateY(${(1 - p) * 120}px) rotate(${(1 - p) * -8}deg)`,
        opacity: Math.min(1, p * 1.5),
      }}
    >
      {word}
    </span>
  );
};

// ------------------------------------------------------------------ STAT
export const StatScene: React.FC<P> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const v = scene.value ?? "";
  const numeric = /^\d+$/.test(v);
  const cnt = interpolate(frame, [10, 55], [0, numeric ? Number(v) : 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const p = useSpring(8, { damping: 9, stiffness: 120, mass: 0.9 });
  const glow = 0.6 + 0.4 * Math.sin(frame / 8);
  return (
    <Area style={{ alignItems: "center", justifyContent: "center" }}>
      <Heading text={scene.heading ?? ""} accent={accent} align="center" size={70} />
      <div
        style={{
          marginTop: 30,
          fontFamily: FONT_DISPLAY,
          fontSize: v.length > 6 ? 200 : 300,
          lineHeight: 1,
          color: COLORS.ink,
          textShadow: `0 0 ${60 * glow}px ${accent}, 8px 8px 0 #000`,
          transform: `scale(${0.4 + 0.6 * p})`,
          opacity: Math.min(1, p * 2),
          whiteSpace: "nowrap",
        }}
      >
        {numeric ? Math.round(cnt) : v}
        {scene.unit ? <span style={{ fontSize: 140, color: accent, marginLeft: 20 }}>{scene.unit}</span> : null}
      </div>
      {scene.note ? (
        <Pop at={30} from="bottom">
          <div
            style={{
              marginTop: 20,
              fontFamily: FONT_BODY,
              fontWeight: 700,
              fontSize: 40,
              color: COLORS.ink,
              background: "rgba(0,0,0,0.55)",
              padding: "12px 30px",
              borderRadius: 14,
              textAlign: "center",
              maxWidth: 1400,
            }}
          >
            {scene.note}
          </div>
        </Pop>
      ) : null}
    </Area>
  );
};

// ---------------------------------------------------------------- BULLETS
export const BulletsScene: React.FC<P & { check?: boolean }> = ({ scene, accent, check }) => {
  const frame = useCurrentFrame();
  const items = (scene.items ?? []) as string[];
  const at = revealFrames(scene, items.length);
  const size = items.length > 4 ? 46 : 54;
  return (
    <Area>
      <Heading text={scene.heading ?? ""} accent={accent} size={items.length > 4 ? 70 : 80} />
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: items.length > 4 ? 20 : 28 }}>
        {items.map((it, i) => {
          const active = frame >= at[i];
          const tick = interpolate(frame - at[i] - 8, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <Pop key={i} at={at[i]}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  background: COLORS.panel,
                  borderLeft: `10px solid ${accent}`,
                  borderRadius: 16,
                  padding: "16px 28px",
                  boxShadow: active ? `0 0 30px ${accent}44` : undefined,
                }}
              >
                {check ? (
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 12,
                      border: `4px solid ${accent}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: tick > 0.5 ? accent : "transparent",
                      flexShrink: 0,
                    }}
                  >
                    <svg viewBox="0 0 40 40" width={40} height={40}>
                      <path
                        d="M8 21 L17 30 L33 11"
                        fill="none"
                        stroke="#0b0018"
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeDasharray={40}
                        strokeDashoffset={40 * (1 - tick)}
                      />
                    </svg>
                  </div>
                ) : (
                  <div
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 52,
                      color: "#0b0018",
                      background: accent,
                      width: 70,
                      height: 70,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                )}
                <div style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: size, color: COLORS.ink }}>{it}</div>
              </div>
            </Pop>
          );
        })}
      </div>
    </Area>
  );
};

// ---------------------------------------------------------------- CLOCKS
export const ClocksScene: React.FC<P> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const rows = scene.rows ?? [];
  const hand = interpolate(frame, [0, 60], [-200, 0], { extrapolateRight: "clamp" });
  return (
    <Area>
      <Heading text={scene.heading ?? ""} accent={accent} size={70} />
      <div style={{ display: "flex", gap: 70, marginTop: 40, alignItems: "center" }}>
        <svg viewBox="0 0 300 300" width={380} height={380} style={{ flexShrink: 0, filter: `drop-shadow(0 0 30px ${accent})` }}>
          <circle cx="150" cy="150" r="140" fill="rgba(10,0,25,0.85)" stroke={accent} strokeWidth="8" />
          {new Array(12).fill(0).map((_, i) => (
            <rect key={i} x="146" y="20" width="8" height={i % 3 === 0 ? 28 : 16} fill="white" transform={`rotate(${i * 30} 150 150)`} />
          ))}
          <rect x="144" y="62" width="12" height="92" rx="6" fill="white" transform={`rotate(${hand / 12} 150 150)`} />
          <rect x="146" y="38" width="8" height="116" rx="4" fill={accent} transform={`rotate(${hand} 150 150)`} />
          <circle cx="150" cy="150" r="12" fill={accent} />
        </svg>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, flex: 1 }}>
          {rows.map((r, i) => (
            <Pop key={i} at={20 + i * 8} from="right">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: COLORS.panel,
                  border: `2px solid ${accent}88`,
                  borderRadius: 16,
                  padding: "16px 26px",
                }}
              >
                <span style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: 40, color: COLORS.ink }}>{r.place}</span>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 54, color: accent }}>
                  {r.time} <span style={{ fontSize: 30, color: COLORS.muted }}>{r.day}</span>
                </span>
              </div>
            </Pop>
          ))}
        </div>
      </div>
      {scene.note ? (
        <Pop at={80} from="bottom">
          <div style={{ marginTop: 30 }}>
            <Chip text={scene.note.toUpperCase()} accent={accent} size={30} />
          </div>
        </Pop>
      ) : null}
    </Area>
  );
};

// --------------------------------------------------------------- COMPARE
export const CompareScene: React.FC<P> = ({ scene, accent }) => {
  const at = revealFrames(scene, 2);
  const col = (c: NonNullable<SceneData["left"]>, color: string, side: "left" | "right", t: number) => (
    <Pop at={t} from={side} style={{ flex: 1 }}>
      <Panel accent={color} style={{ height: "100%" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 70, color: COLORS.ink, letterSpacing: 2 }}>{c.title}</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 90, color, textShadow: `0 0 30px ${color}`, margin: "6px 0 18px" }}>{c.price}</div>
        {c.items.map((it, i) => (
          <div key={i} style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 40, color: COLORS.ink, margin: "10px 0", display: "flex", gap: 16 }}>
            <span style={{ color }}>▸</span>
            {it}
          </div>
        ))}
      </Panel>
    </Pop>
  );
  return (
    <Area>
      <Heading text={scene.heading ?? ""} accent={accent} size={70} />
      <div style={{ display: "flex", gap: 50, marginTop: 40, flex: 1 }}>
        {scene.left ? col(scene.left, COLORS.cyan, "left", at[0]) : null}
        {scene.right ? col(scene.right, accent === COLORS.cyan ? COLORS.yellow : accent, "right", at[1]) : null}
      </div>
    </Area>
  );
};

// ----------------------------------------------------------------- ALERT
export const AlertScene: React.FC<P> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const warn = scene.tone !== "info";
  const color = warn ? COLORS.yellow : accent;
  const p = useSpring(4, { damping: 8, stiffness: 160, mass: 0.7 });
  const pulse = 1 + 0.04 * Math.sin(frame / 6);
  const tape = (top: number, dir: number) => (
    <div
      style={{
        position: "absolute",
        left: -100,
        right: -100,
        top,
        height: 70,
        transform: `rotate(${dir * 3}deg)`,
        backgroundImage: `repeating-linear-gradient(45deg, ${color} 0 40px, #111 40px 80px)`,
        backgroundPosition: `${frame * 4 * dir}px 0`,
        opacity: 0.9,
        boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
      }}
    />
  );
  return (
    <AbsoluteFill>
      {tape(90, 1)}
      {tape(770, -1)}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 60 }}>
        <svg viewBox="0 0 200 180" width={230} height={207} style={{ transform: `scale(${p * pulse})`, filter: `drop-shadow(0 0 30px ${color})` }}>
          <path d="M100 8 L192 170 L8 170 Z" fill={color} stroke="#111" strokeWidth={8} strokeLinejoin="round" />
          <rect x="91" y="58" width="18" height="66" rx="8" fill="#111" />
          <circle cx="100" cy="146" r="11" fill="#111" />
        </svg>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 110,
            color: COLORS.ink,
            textShadow: `0 0 30px ${color}, 6px 6px 0 #000`,
            marginTop: 20,
            opacity: p,
            textAlign: "center",
          }}
        >
          {scene.heading}
        </div>
        <Pop at={18} from="bottom">
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 700,
              fontSize: 44,
              color: COLORS.ink,
              background: "rgba(0,0,0,0.65)",
              padding: "14px 34px",
              borderRadius: 14,
              marginTop: 14,
              maxWidth: 1500,
              textAlign: "center",
            }}
          >
            {scene.text}
          </div>
        </Pop>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------- MAP
export const MapScene: React.FC<P> = ({ scene, accent }) => {
  return (
    <Area style={{ flexDirection: "row", alignItems: "center", gap: 60 }}>
      <div style={{ flex: 1 }}>
        <Heading text={scene.heading ?? ""} accent={accent} size={scene.highlight ? 120 : 90} />
        <Pop at={14} from="bottom">
          <div style={{ marginTop: 30, fontFamily: FONT_BODY, fontWeight: 800, fontSize: 46, color: COLORS.ink }}>{scene.sub}</div>
        </Pop>
      </div>
      <div style={{ width: 660, height: 660, marginTop: 40 }}>
        <LeonidaMap highlight={scene.highlight} accent={accent} />
      </div>
    </Area>
  );
};

// ------------------------------------------------------------------ CARD
export const CardScene: React.FC<P> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const p = useSpring(2);
  const ring = frame * 1.5;
  return (
    <Area style={{ flexDirection: "row", alignItems: "center", gap: 80 }}>
      <div style={{ position: "relative", width: 520, height: 520, flexShrink: 0, transform: `scale(${0.6 + 0.4 * p})`, opacity: p }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `conic-gradient(from ${ring}deg, ${accent}, ${COLORS.cyan}, ${COLORS.yellow}, ${accent})`,
            boxShadow: `0 0 80px ${accent}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 18,
            borderRadius: "50%",
            background: "radial-gradient(circle at 50% 35%, #2a0645, #07000f)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* silueta genérica */}
          <svg viewBox="0 0 200 200" width={480} height={480} style={{ position: "absolute", bottom: -60, opacity: 0.35 }}>
            <circle cx="100" cy="70" r="38" fill={accent} />
            <path d="M30 200 C 30 130, 170 130, 170 200 Z" fill={accent} />
          </svg>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 210, color: COLORS.ink, textShadow: `0 0 40px ${accent}, 6px 6px 0 #000`, position: "relative" }}>
            {scene.initials}
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Pop at={6}>
          <Chip text={scene.tag ?? ""} accent={accent} />
        </Pop>
        <Pop at={10}>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 120,
              lineHeight: 1.05,
              color: COLORS.ink,
              textShadow: `0 0 30px ${accent}, 6px 6px 0 #000`,
              marginTop: 20,
            }}
          >
            {scene.name}
          </div>
        </Pop>
        <Pop at={20} from="bottom">
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 800,
              fontSize: 46,
              color: COLORS.ink,
              background: "rgba(0,0,0,0.6)",
              borderLeft: `10px solid ${accent}`,
              padding: "14px 28px",
              borderRadius: 12,
              marginTop: 24,
            }}
          >
            {scene.role}
          </div>
        </Pop>
      </div>
    </Area>
  );
};

// -------------------------------------------------------------- TIMELINE
export const TimelineScene: React.FC<P> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const items = (scene.items ?? []) as { year: string; label: string }[];
  const at = revealFrames(scene, items.length);
  const lastAt = at[at.length - 1] ?? 0;
  const lineP = interpolate(frame, [at[0] ?? 0, lastAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Area>
      <Heading text={scene.heading ?? ""} accent={accent} size={76} />
      <div style={{ position: "relative", marginTop: 120, height: 400 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, height: 10, background: "rgba(255,255,255,0.15)", borderRadius: 6 }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            width: `${(items.length === 1 ? 1 : lineP) * 100}%`,
            top: 150,
            height: 10,
            background: accent,
            boxShadow: `0 0 24px ${accent}`,
            borderRadius: 6,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {items.map((it, i) => (
            <Pop key={i} at={at[i]} from="scale" style={{ width: 1620 / items.length, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: items.length > 3 ? 64 : 76, color: COLORS.ink, textShadow: `0 0 20px ${accent}`, height: 110, whiteSpace: "nowrap" }}>
                {it.year}
              </div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: accent,
                  border: "8px solid #fff",
                  boxShadow: `0 0 30px ${accent}`,
                  marginTop: 0,
                }}
              />
              <div
                style={{
                  marginTop: 34,
                  fontFamily: FONT_BODY,
                  fontWeight: 900,
                  fontSize: 44,
                  color: "#0b0018",
                  background: COLORS.ink,
                  padding: "10px 24px",
                  borderRadius: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {it.label}
              </div>
            </Pop>
          ))}
        </div>
      </div>
    </Area>
  );
};

// ----------------------------------------------------------------- OUTRO
export const OutroScene: React.FC<P> = ({ scene, accent }) => {
  const frame = useCurrentFrame();
  const p = useSpring(4);
  const click = frame > 70;
  const btnScale = interpolate(frame, [60, 66, 72], [1, 0.88, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bell = click ? Math.sin((frame - 70) / 2) * Math.max(0, 25 - (frame - 70) * 0.6) : 0;
  const cursorX = interpolate(frame, [20, 60], [1500, 1010], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cursorY = interpolate(frame, [20, 60], [900, 640], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 160 }}>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 120,
          color: COLORS.ink,
          textShadow: `0 0 40px ${accent}, 6px 6px 0 #000`,
          opacity: p,
          transform: `scale(${0.8 + 0.2 * p})`,
          textAlign: "center",
        }}
      >
        {scene.text}
      </div>
      <div style={{ display: "flex", gap: 40, alignItems: "center", marginTop: 50 }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 900,
            fontSize: 54,
            letterSpacing: 2,
            padding: "22px 56px",
            borderRadius: 16,
            background: click ? "#3a3a3a" : "#ff0033",
            color: "#fff",
            transform: `scale(${btnScale})`,
            boxShadow: click ? undefined : "0 0 40px #ff0033",
          }}
        >
          {click ? "SUSCRITO ✓" : "SUSCRIBIRSE"}
        </div>
        <svg viewBox="0 0 100 100" width={110} height={110} style={{ transform: `rotate(${bell}deg)`, transformOrigin: "50% 10%" }}>
          <path d="M50 10 C 28 10, 22 30, 22 50 L 22 66 L 12 78 L 88 78 L 78 66 L 78 50 C 78 30, 72 10, 50 10 Z" fill={click ? COLORS.yellow : "#fff"} />
          <circle cx="50" cy="86" r="9" fill={click ? COLORS.yellow : "#fff"} />
        </svg>
      </div>
      <div style={{ marginTop: 50, fontFamily: FONT_DISPLAY, fontSize: 64, color: accent, letterSpacing: 6, textShadow: "4px 4px 0 #000" }}>{CHANNEL_NAME}</div>
      <div style={{ marginTop: 10, fontFamily: FONT_BODY, fontSize: 26, color: COLORS.muted }}>{DISCLAIMER}</div>
      {/* cursor */}
      <svg viewBox="0 0 24 24" width={70} height={70} style={{ position: "absolute", left: cursorX, top: cursorY, opacity: frame < 110 ? 1 : 0 }}>
        <path d="M3 2 L3 20 L8 15 L11 22 L14 21 L11 14 L18 14 Z" fill="#fff" stroke="#000" strokeWidth={1.5} />
      </svg>
    </AbsoluteFill>
  );
};

export const SceneSwitch: React.FC<P> = (props) => {
  switch (props.scene.type) {
    case "title":
      return <TitleScene {...props} />;
    case "stat":
      return <StatScene {...props} />;
    case "bullets":
      return <BulletsScene {...props} />;
    case "checklist":
      return <BulletsScene {...props} check />;
    case "clocks":
      return <ClocksScene {...props} />;
    case "compare":
      return <CompareScene {...props} />;
    case "alert":
      return <AlertScene {...props} />;
    case "map":
      return <MapScene {...props} />;
    case "card":
      return <CardScene {...props} />;
    case "timeline":
      return <TimelineScene {...props} />;
    case "outro":
      return <OutroScene {...props} />;
    default:
      return null;
  }
};
