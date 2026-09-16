/**
 * Tile width the Roblox website would use at a given window width.
 *
 * Measured on the real home page (window -> tile): 830 -> 250, 1230 -> 285,
 * 1614 -> 239, 1898 -> 241, 2550 -> 346. Roblox fits as many ~235px tiles as
 * the content area allows (max 6 per row) and stretches them to fill, so the
 * width is a sawtooth, not a smooth scale. The content area is the window
 * minus the sidebar and page padding (about 350px; 48px when the sidebar
 * collapses on narrow windows).
 */
export function robloxTileWidth(windowWidth: number): number {
  const gap = 16;
  const minTile = 232;
  const maxCols = 6;
  const maxTile = 360; // largest measured was 346 at 2550px; don't extrapolate to ultrawide
  const content = windowWidth - (windowWidth < 1000 ? 48 : 350);
  const cols = Math.min(maxCols, Math.max(1, Math.floor((content + gap) / (minTile + gap))));
  const w = (content - (cols - 1) * gap) / cols;
  // Our row is always 4 tiles wide; never let it overflow the window.
  return Math.floor(Math.min(w, maxTile, (windowWidth - 2 * 24 - 3 * gap) / 4));
}

/** Keeps the --tile CSS variable in sync with the window width. */
export function watchTileWidth(): () => void {
  const apply = () =>
    document.documentElement.style.setProperty("--tile", `${robloxTileWidth(window.innerWidth)}px`);
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
