export type Sentence = { text: string; startFrame: number; endFrame: number };

export type SceneData = {
  type:
    | "title"
    | "stat"
    | "clocks"
    | "bullets"
    | "checklist"
    | "compare"
    | "alert"
    | "map"
    | "card"
    | "timeline"
    | "outro";
  from: number;
  durationInFrames: number;
  sentences: Sentence[];
  chapter?: string;
  // props por tipo (opcionales)
  kicker?: string;
  title?: string;
  subtitle?: string;
  heading?: string;
  value?: string;
  unit?: string;
  note?: string;
  items?: unknown[];
  rows?: { place: string; time: string; day: string }[];
  left?: { title: string; price: string; items: string[] };
  right?: { title: string; price: string; items: string[] };
  tone?: "warn" | "info";
  text?: string;
  highlight?: string;
  sub?: string;
  name?: string;
  role?: string;
  tag?: string;
  initials?: string;
};

export type VideoData = {
  id: string;
  slug: string;
  title: string;
  accent: string;
  thumb: { top: string; big: string; badge: string };
  audio: string;
  durationInFrames: number;
  scenes: SceneData[];
};
