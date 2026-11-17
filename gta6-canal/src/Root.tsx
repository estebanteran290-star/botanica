import React from "react";
import { Composition, Still } from "remotion";
import manifest from "./data/manifest.json";
import { GtaVideo } from "./Video";
import { Thumbnail } from "./Thumbnail";
import type { VideoData } from "./types";

const videos = manifest.videos as unknown as VideoData[];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {videos.map((v) => (
        <React.Fragment key={v.id}>
          <Composition
            id={`video-${v.id}`}
            component={GtaVideo}
            durationInFrames={v.durationInFrames}
            fps={manifest.fps}
            width={1920}
            height={1080}
            defaultProps={{ video: v }}
          />
          <Still id={`thumb-${v.id}`} component={Thumbnail} width={1920} height={1080} defaultProps={{ video: v }} />
        </React.Fragment>
      ))}
    </>
  );
};
