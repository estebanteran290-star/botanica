import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY } from "../brand";

// Esquema orientativo propio (no es el mapa oficial del juego).
const REGIONS: Record<string, { x: number; y: number; label: string; r: number }> = {
  gellhorn: { x: 180, y: 200, label: "PORT GELLHORN", r: 70 },
  kalaga: { x: 560, y: 215, label: "MOUNT KALAGA", r: 75 },
  ambrosia: { x: 590, y: 420, label: "AMBROSIA", r: 85 },
  grass: { x: 590, y: 630, label: "GRASSRIVERS", r: 85 },
  vice: { x: 770, y: 640, label: "VICE CITY", r: 70 },
  keys: { x: 560, y: 905, label: "LEONIDA KEYS", r: 70 },
};

const LAND =
  "M 40 175 L 300 140 L 560 150 L 640 128 L 705 190 L 728 300 L 765 450 L 805 600 L 798 720 L 745 800 L 680 835 L 640 822 L 600 760 L 560 660 L 520 560 L 500 460 L 470 362 L 430 292 L 360 262 L 260 252 L 150 244 L 60 254 Z";

export const LeonidaMap: React.FC<{ highlight?: string; accent: string }> = ({ highlight, accent }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 40], [3000, 0], { extrapolateRight: "clamp" });
  const h = highlight ? REGIONS[highlight] : undefined;
  const zoom = h ? interpolate(frame, [0, 30], [1, 1.12], { extrapolateRight: "clamp" }) : 1;
  const pulse = 1 + 0.12 * Math.sin(frame / 6);
  return (
    <svg viewBox="0 30 1000 960" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <filter id="mapGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <g transform={h ? `translate(${h.x} ${h.y}) scale(${zoom}) translate(${-h.x} ${-h.y})` : undefined}>
        {/* mar con retícula */}
        {new Array(11).fill(0).map((_, i) => (
          <g key={i} stroke="rgba(255,255,255,0.08)" strokeWidth={2}>
            <line x1={i * 100} y1={0} x2={i * 100} y2={1000} />
            <line x1={0} y1={i * 100} x2={1000} y2={i * 100} />
          </g>
        ))}
        <path d={LAND} fill="none" stroke={accent} strokeWidth={26} opacity={0.25} strokeLinejoin="round" />
        <path d={LAND} fill="rgba(20,4,40,0.92)" stroke={accent} strokeWidth={6} strokeDasharray={3000} strokeDashoffset={draw} strokeLinejoin="round" />
        {/* lago */}
        <ellipse cx={640} cy={500} rx={38} ry={30} fill={COLORS.cyan} opacity={0.35} />
        {/* cayos */}
        {[
          [660, 862],
          [620, 884],
          [580, 900],
          [540, 912],
          [500, 922],
          [455, 930],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={22} ry={9} fill="rgba(20,4,40,0.92)" stroke={accent} strokeWidth={4} />
        ))}
        {Object.entries(REGIONS).map(([id, r], i) => {
          const isH = id === highlight;
          const appear = interpolate(frame, [10 + i * 5, 22 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const dim = highlight && !isH ? 0.35 : 1;
          return (
            <g key={id} opacity={appear * dim}>
              <circle cx={r.x} cy={r.y} r={r.r * (isH ? pulse : 1)} fill={isH ? accent : "transparent"} opacity={isH ? 0.35 : 1} stroke={isH ? "#fff" : accent} strokeWidth={isH ? 6 : 3} strokeDasharray={isH ? undefined : "10 8"} />
              <circle cx={r.x} cy={r.y} r={10} fill={isH ? "#fff" : accent} />
              <text
                x={r.x}
                y={r.y - r.r - 14}
                textAnchor="middle"
                fontFamily={FONT_DISPLAY}
                fontSize={isH ? 52 : 38}
                fill="#fff"
                stroke="#000"
                strokeWidth={isH ? 8 : 6}
                paintOrder="stroke"
              >
                {r.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};
