export interface ManifestEntry {
  id: string; // filename without extension, e.g. "07" or "harbour-wide"
  file: string; // e.g. "07.webp"
}

export interface Tile {
  id: string;
  src: string;
  name: string; // invented name displayed under the tile
  playing: number;
  rating: number;
}

export interface GridRecord {
  session: string;
  device: string; // random id kept in localStorage, survives across sessions
  ip: string; // public IP looked up client-side; "" if the lookup failed
  grid: number;
  shown: string[]; // thumbnail ids in display order
  names: string[]; // name shown on each tile, same order
  clicked: string; // thumbnail id
  clickedPos: number; // 0..TILES_PER_GRID-1
  ms: number;
}

export type AgeBand = "under13" | "13to17" | "18plus";
export type Platform = "mobile" | "pc" | "console";

export interface SessionRecord {
  session: string;
  device: string;
  ip: string;
  age: AgeBand;
  platform: Platform;
  playsEH: boolean;
  gridsCompleted: number;
  userAgent: string;
}
