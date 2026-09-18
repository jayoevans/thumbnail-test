// ---------------------------------------------------------------------------
// Edit this file to configure the test.
// ---------------------------------------------------------------------------

/** Google Apps Script web-app URL (see apps-script/Code.gs and README). */
export const SHEET_ENDPOINT = import.meta.env.VITE_SHEET_ENDPOINT ?? "";

/** How many grids each respondent sees. */
export const GRIDS_PER_SESSION = 15;

/**
 * Thumbnails per grid. Every tile is a test thumbnail, so each click is one
 * choice among TILES_PER_GRID of them. 8 gives a 4x2 grid on desktop and 2x4
 * on phones; 4 gives 2x2 everywhere. Must not exceed the number of images
 * in public/thumbs, nor the number of FAKE_NAMES.
 */
export const TILES_PER_GRID = 8;

/**
 * Neutral invented game names for the tiles. A random name is assigned to
 * each tile on every grid, so no name is tied to any thumbnail.
 *
 * Keep them bland and similar: place-style names with the same two suffixes,
 * nothing that describes content (no "Autobahn", "Blaulicht", "Rettung"),
 * so the name can't favour a thumbnail that happens to match it.
 */
export const FAKE_NAMES = [
  "Nordstadt RP",
  "Hafen City",
  "Hansa City",
  "Altstadt RP",
  "Elbe City",
  "Weststadt RP",
  "Neustadt City",
  "Seestadt RP",
  "Oststadt City",
  "Holstein RP",
  "Marktstadt City",
  "Südstadt RP",
];

/**
 * Player-count band shown on tiles (Roblox shows e.g. "10.4K playing").
 * Deliberately narrow so the numbers read as "all mid-size" rather than
 * giving any tile a popularity edge.
 */
export const FAKE_PLAYING_MIN = 7_000;
export const FAKE_PLAYING_MAX = 9_000;

/** Rating band shown on tiles, also narrow. */
export const FAKE_RATING_MIN = 89;
export const FAKE_RATING_MAX = 92;

/** Secret query param for the results page: /?results=<RESULTS_KEY>. Empty disables the page. */
export const RESULTS_KEY = import.meta.env.VITE_RESULTS_KEY || "";
