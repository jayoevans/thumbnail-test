/**
 * Tile width the Roblox website uses for its "Recommended For You" row at a
 * given window width, reconstructed from ~250 measurements taken while
 * resizing the real page (Sept 2026).
 *
 * The rule Roblox follows: tile = (window - offset) / columns, where the
 * offset is page padding + sidebar + (columns - 1) * gap. The sidebar appears
 * at about 1160px, which is why columns drop from 4 back to 3 there. Columns
 * increase whenever the next column would still leave tiles ~235px wide, and
 * the width is capped at 387px on very wide windows.
 *
 *   window     columns   offset
 *   < 320      -         fixed 127px
 *   320-769    2         62
 *   770-1035   3         78 -> 90 (drifts slightly)
 *   1036-1160  4         107
 *   1161-1359  3         375   (sidebar now present)
 *   1360-1611  4         400
 *   1612-1869  5         425
 *   1870-2809  6         450 -> 488 (drifts slightly)
 *   > 2810     -         fixed 387px
 */
export function robloxTileWidth(w: number): number {
  let t: number;
  if (w < 320) t = 127;
  else if (w < 770) t = Math.max(137, (w - 62) / 2);
  else if (w < 1036) t = (w - (78 + 0.045 * (w - 770))) / 3;
  else if (w < 1161) t = (w - 107) / 4;
  else if (w < 1360) t = (w - 375) / 3;
  else if (w < 1612) t = (w - 400) / 4;
  else if (w < 1870) t = (w - 425) / 5;
  else if (w < 2810) t = (w - (450 + 0.042 * (w - 1910))) / 6;
  else t = 387;
  return Math.round(t);
}

/** Horizontal gap between tiles, matching Roblox. Keep in sync with styles.css. */
export const TILE_GAP = 24;
/** Side padding of our page. Keep in sync with styles.css. */
const PAGE_PADDING = 24;

/**
 * Width for our tiles: Roblox's width, clamped so that our fixed row of 4
 * always fits in the window (Roblox itself shows only 2-3 columns below
 * ~1000px, so we cannot match it there).
 */
export function ourTileWidth(windowWidth: number): number {
  const fit = (windowWidth - 2 * PAGE_PADDING - 3 * TILE_GAP) / 4;
  return Math.floor(Math.min(robloxTileWidth(windowWidth), fit));
}

/** Keeps the --tile CSS variable in sync with the window width. */
export function watchTileWidth(): () => void {
  const apply = () =>
    document.documentElement.style.setProperty("--tile", `${ourTileWidth(window.innerWidth)}px`);
  apply();
  window.addEventListener("resize", apply);
  // ResizeObserver catches viewport changes that don't fire "resize"
  // (e.g. devtools device emulation, some in-app browsers).
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(apply) : null;
  ro?.observe(document.documentElement);
  return () => {
    window.removeEventListener("resize", apply);
    ro?.disconnect();
  };
}
