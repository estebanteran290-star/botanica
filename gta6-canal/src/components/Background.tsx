import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../brand";

// Palmera estilizada original (silueta SVG).
export const Palm: React.FC<{ x: number; scale: number; flip?: boolean; sway: number }> = ({
  x,
  scale,
  flip,
  sway,
}) => {
  return (
    <svg
      viewBox="0 0 400 700"
      style={{
        position: "absolute",
        bottom: 250,
        left: x,
        width: 400 * scale,
        height: 700 * scale,
        transform: `scaleX(${flip ? -1 : 1})`,
        transformOrigin: "bottom center",
      }}
    >
      <g fill="#0a0014">
        <path d="M200 700 C 205 520, 190 380, 225 210 L 238 212 C 210 380, 222 520, 222 700 Z" />
        <g transform={`rotate(${sway} 232 210)`}>
          <path d="M232 210 C 160 150, 80 160, 10 230 C 90 190, 160 195, 232 222 Z" />
          <path d="M232 210 C 180 120, 110 80, 40 90 C 110 110, 170 150, 228 220 Z" />
          <path d="M232 210 C 250 120, 300 70, 380 60 C 310 100, 270 150, 240 222 Z" />
          <path d="M232 210 C 300 160, 360 170, 400 240 C 340 205, 290 200, 238 224 Z" />
          <path d="M232 210 C 230 140, 200 80, 160 30 C 220 70, 250 130, 242 214 Z" />
          <path d="M232 210 C 150 220, 100 270, 70 340 C 120 280, 170 245, 232 226 Z" />
          <path d="M232 210 C 310 220, 350 270, 370 340 C 330 280, 290 245, 236 226 Z" />
        </g>
      </g>
    </svg>
  );
};

export const Background: React.FC<{ accent: string; intensity?: number; vignette?: number }> = ({ accent, intensity = 1, vignette = 1 }) => {
  const frame = useCurrentFrame();
  const gridShift = (frame * 3) % 80;
  const sway = Math.sin(frame / 40) * 2.5;
  const sunY = interpolate(Math.sin(frame / 120), [-1, 1], [0, 14]);

  return (
    <AbsoluteFill style={{ background: COLORS.bgTop, overflow: "hidden" }}>
      {/* cielo */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${COLORS.bgTop} 0%, ${COLORS.bgMid} 45%, #8a0f6a 64%, ${COLORS.bgLow} 75%, #ff9a3d 82%)`,
          opacity: 0.95 * intensity,
        }}
      />
      {/* estrellas */}
      <AbsoluteFill>
        {new Array(60).fill(0).map((_, i) => {
          const x = (i * 337) % 1920;
          const y = (i * 151) % 520;
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / 25 + i));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: i % 7 === 0 ? 4 : 2,
                height: i % 7 === 0 ? 4 : 2,
                borderRadius: 4,
                background: "white",
                opacity: tw * 0.7,
              }}
            />
          );
        })}
      </AbsoluteFill>
      {/* sol con franjas */}
      <svg
        viewBox="0 0 660 660"
        style={{ position: "absolute", left: 960 - 330, top: 170 + sunY, width: 660, height: 660, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe66d" />
            <stop offset="45%" stopColor="#ff9a3d" />
            <stop offset="85%" stopColor={accent} />
          </linearGradient>
          <mask id="sunMask">
            <rect x="0" y="0" width="660" height="660" fill="white" />
            {new Array(9).fill(0).map((_, i) => (
              <rect key={i} x="0" y={340 + i * 36} width="660" height={6 + i * 2.2} fill="black" />
            ))}
          </mask>
          <radialGradient id="sunHalo">
            <stop offset="60%" stopColor={accent} stopOpacity={0.5} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx="330" cy="330" r="470" fill="url(#sunHalo)" />
        <circle cx="330" cy="330" r="330" fill="url(#sunGrad)" mask="url(#sunMask)" opacity={0.92} />
      </svg>
      {/* skyline */}
      <svg viewBox="0 0 1920 300" style={{ position: "absolute", left: 0, bottom: 250, width: 1920, height: 300 }}>
        <g fill="#170027">
          {new Array(34).fill(0).map((_, i) => {
            const w = 40 + ((i * 53) % 50);
            const h = 60 + ((i * 97) % 220);
            const x = i * 58;
            return <rect key={i} x={x} y={300 - h} width={w} height={h} />;
          })}
        </g>
        <g fill={accent} opacity={0.55}>
          {new Array(80).fill(0).map((_, i) => {
            const on = Math.sin(frame / 15 + i * 7) > 0.2;
            return on ? (
              <rect key={i} x={(i * 97) % 1920} y={300 - ((i * 41) % 200) - 20} width={4} height={6} />
            ) : null;
          })}
        </g>
      </svg>
      <Palm x={-40} scale={1.05} sway={sway} />
      <Palm x={1560} scale={0.95} flip sway={-sway} />
      {/* suelo con rejilla en perspectiva */}
      <div
        style={{
          position: "absolute",
          left: -600,
          right: -600,
          bottom: -200,
          height: 520,
          transform: "perspective(500px) rotateX(62deg)",
          transformOrigin: "top center",
          background: `#0b0018`,
          backgroundImage: `linear-gradient(${accent} 3px, transparent 3px), linear-gradient(90deg, ${accent} 3px, transparent 3px)`,
          backgroundSize: "80px 80px",
          backgroundPosition: `0px ${gridShift}px`,
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 250,
          height: 4,
          background: accent,
          boxShadow: `0 0 30px 8px ${accent}`,
        }}
      />
      {/* oscurecido para legibilidad */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(5,0,15,0.25) 0%, rgba(5,0,15,0.75) 100%)", opacity: vignette }} />
      {/* scanlines */}
      <AbsoluteFill
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 2px, transparent 2px, transparent 5px)",
        }}
      />
    </AbsoluteFill>
  );
};
