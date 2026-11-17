import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_BODY, FONT_DISPLAY } from "../brand";
import type { SceneData } from "../types";

export const useSpring = (delay = 0, config = { damping: 14, stiffness: 120, mass: 0.8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};

// Frame en el que debe aparecer el elemento i: al empezar la frase i+1 (la 0 es intro).
export const revealFrames = (scene: SceneData, n: number): number[] => {
  const s = scene.sentences;
  if (s.length >= n + 1) {
    return new Array(n).fill(0).map((_, i) => Math.max(0, s[i + 1].startFrame - 4));
  }
  const first = s[0]?.startFrame ?? 10;
  const span = Math.max(30, scene.durationInFrames * 0.7 - first);
  return new Array(n).fill(0).map((_, i) => Math.round(first + (span * i) / n));
};

export const Heading: React.FC<{ text: string; accent: string; delay?: number; size?: number; align?: "left" | "center" }> = ({
  text,
  accent,
  delay = 0,
  size = 84,
  align = "left",
}) => {
  const p = useSpring(delay);
  const frame = useCurrentFrame();
  const barW = interpolate(frame - delay, [0, 18], [0, 220], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ textAlign: align }}>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: size,
          lineHeight: 1.02,
          color: COLORS.ink,
          letterSpacing: 1,
          textShadow: `0 0 24px ${accent}aa, 4px 4px 0 #000`,
          transform: `translateY(${(1 - p) * 40}px)`,
          opacity: p,
        }}
      >
        {text}
      </div>
      <div
        style={{
          height: 8,
          width: barW,
          background: accent,
          boxShadow: `0 0 20px ${accent}`,
          marginTop: 18,
          marginLeft: align === "center" ? "auto" : 0,
          marginRight: align === "center" ? "auto" : 0,
          borderRadius: 4,
        }}
      />
    </div>
  );
};

export const Panel: React.FC<{ accent: string; style?: React.CSSProperties; children: React.ReactNode }> = ({
  accent,
  style,
  children,
}) => (
  <div
    style={{
      background: COLORS.panel,
      border: `3px solid ${accent}`,
      boxShadow: `0 0 40px ${accent}55, inset 0 0 40px ${accent}22`,
      borderRadius: 24,
      padding: 36,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{ text: string; accent: string; dark?: boolean; size?: number }> = ({ text, accent, dark, size = 30 }) => (
  <span
    style={{
      display: "inline-block",
      fontFamily: FONT_BODY,
      fontWeight: 900,
      fontSize: size,
      letterSpacing: 4,
      padding: "8px 22px",
      borderRadius: 999,
      background: dark ? "rgba(0,0,0,0.6)" : accent,
      color: dark ? accent : "#0b0018",
      border: `3px solid ${accent}`,
    }}
  >
    {text}
  </span>
);
