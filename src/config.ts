// ---------------------------------------------------------------------------
// Edit this file to configure the test.
// ---------------------------------------------------------------------------

/** Google Apps Script web-app URL (see apps-script/Code.gs and README). */
export const SHEET_ENDPOINT = import.meta.env.VITE_SHEET_ENDPOINT ?? "";

/** How many grids each respondent sees. */
export const GRIDS_PER_SESSION = 10;

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
 */
export const FAKE_NAMES = [
  "Nordstadt RP",
  "Hafen City",
  "Rettungsdienst Nord",
  "Küstenwache",
  "Rettung Nord",
  "Blaulicht Stadt",
  "Elbe Roleplay",
  "Metropolis Nord",
  "Autobahn Life",
  "Nordlicht RP",
  "Stadtwache",
  "Hansa City",
];

/** Player-count band shown on tiles (Roblox shows e.g. "12.3K playing"). */
export const FAKE_PLAYING_MIN = 2_000;
export const FAKE_PLAYING_MAX = 25_000;

/** Rating band shown on tiles. */
export const FAKE_RATING_MIN = 84;
export const FAKE_RATING_MAX = 95;

/** Secret query param for the results page: /?results=<RESULTS_KEY> */
export const RESULTS_KEY = import.meta.env.VITE_RESULTS_KEY ?? "eh";
