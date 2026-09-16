import {
  FAKE_NAMES,
  FAKE_PLAYING_MAX,
  FAKE_PLAYING_MIN,
  FAKE_RATING_MAX,
  FAKE_RATING_MIN,
  GRIDS_PER_SESSION,
  TILES_PER_GRID,
} from "../config";
import type { ManifestEntry, Tile } from "../types";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

/**
 * Build the full sequence of grids for one session up front.
 *
 * Each grid draws the images with the fewest appearances so far in this
 * session (ties broken randomly), so every image is shown the same number of
 * times (±1) and never twice in one grid. Positions and names are shuffled.
 */
export function buildSessionGrids(images: ManifestEntry[]): Tile[][] {
  const counts = new Map(images.map((e) => [e.id, 0]));
  const grids: Tile[][] = [];
  for (let g = 0; g < GRIDS_PER_SESSION; g++) {
    const names = shuffle(FAKE_NAMES);
    const tiles: Tile[] = drawLeastSeen(images, counts, TILES_PER_GRID).map((e, i) => ({
      id: e.id,
      src: `${import.meta.env.BASE_URL}thumbs/${e.file}`,
      name: names[i % names.length],
      playing: randInt(FAKE_PLAYING_MIN, FAKE_PLAYING_MAX),
      rating: randInt(FAKE_RATING_MIN, FAKE_RATING_MAX),
    }));
    grids.push(shuffle(tiles));
  }
  return grids;
}

/** Pick `n` distinct entries with the lowest counts, random among ties, and bump their counts. */
function drawLeastSeen(items: ManifestEntry[], counts: Map<string, number>, n: number): ManifestEntry[] {
  const picked = shuffle(items)
    .sort((a, b) => (counts.get(a.id) ?? 0) - (counts.get(b.id) ?? 0))
    .slice(0, n);
  for (const e of picked) counts.set(e.id, (counts.get(e.id) ?? 0) + 1);
  return picked;
}

export function formatPlaying(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n);
}
