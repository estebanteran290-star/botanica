import React from "react";
import { AbsoluteFill } from "remotion";
import "@fontsource/anton/400.css";
import "@fontsource/inter/900.css";
import { Background } from "./components/Background";
import { CHANNEL_NAME, FONT_BODY, FONT_DISPLAY } from "./brand";
import type { VideoData } from "./types";

// Miniatura 1280x720 (renderizada a 1920x1080 para más nitidez).
export const Thumbnail: React.FC<{ video: VideoData }> = ({ video }) => {
  const { top, big, badge } = video.thumb;
  const bigSize = big.length > 10 ? 210 : big.length > 7 ? 260 : 300;
  return (
    <AbsoluteFill>
      <Background accent={video.accent} intensity={1.15} vignette={0.25} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 70%, transparent 100%)" }} />
      <AbsoluteFill style={{ padding: "90px 100px", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 140,
            color: "#fff",
            lineHeight: 1,
            WebkitTextStroke: "4px #000",
            textShadow: "8px 8px 0 #000",
          }}
        >
          {top}
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: bigSize,
            color: video.accent,
            lineHeight: 0.95,
            WebkitTextStroke: "6px #fff",
            textShadow: `0 0 60px ${video.accent}, 12px 12px 0 #000`,
            marginTop: 10,
            maxWidth: 1750,
          }}
        >
          {big}
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 70,
          transform: "rotate(6deg)",
          fontFamily: FONT_DISPLAY,
          fontSize: 100,
          color: "#0b0018",
          background: "#ffd23f",
          padding: "10px 40px",
          borderRadius: 20,
          border: "8px solid #000",
          boxShadow: "10px 10px 0 #000",
        }}
      >
        {badge}
      </div>
      <div
        style={{
          position: "absolute",
          left: 100,
          bottom: 60,
          fontFamily: FONT_BODY,
          fontWeight: 900,
          fontSize: 44,
          letterSpacing: 6,
          color: "#fff",
          background: "rgba(0,0,0,0.7)",
          padding: "8px 24px",
          borderRadius: 12,
          borderLeft: `10px solid ${video.accent}`,
        }}
      >
        {CHANNEL_NAME}
      </div>
    </AbsoluteFill>
  );
};
