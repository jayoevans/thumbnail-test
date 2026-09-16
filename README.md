# Thumbnail test

A one-page site that shows respondents a fake Roblox "Recommended for you" row
of 8 candidate thumbnails under random invented names and records which one
they'd open. Ten rows per person, three demographic questions at the end. Rows
go to a Google Sheet.

Every tile is a candidate, so each click is a straight vote for one thumbnail
over the seven others on screen. That is what the ranking needs; it is not a
CTR estimate and is not meant to be one. Take the top two or three into a real
A/B test on Roblox.

## 1. Images

```
raw-images/   one file per thumbnail to test, any name (01.png, harbour-wide.jpg …)
```

`raw-images/` is git-ignored; only the resized copies in `public/thumbs/` are committed.
Whenever the folder changes:

```
npm run prepare-images
```

This resizes everything to 480×270 WebP and writes `public/thumbs/manifest.json`.
You need at least 8 images (see `TILES_PER_GRID` in `src/config.ts` to change the grid).
With 17 images and 10 grids each thumbnail is shown 4 or 5 times per person.

## 2. Google Sheet

1. Create a blank Google Sheet.
2. Extensions → Apps Script, replace the contents with `apps-script/Code.gs`, save.
3. Deploy → New deployment → type "Web app" → Execute as **Me**, Who has access
   **Anyone** → Deploy. Authorise when asked.
4. Copy the web-app URL (ends in `/exec`).

Two tabs, `grids` and `sessions`, appear after the first response.
Re-deploy (Deploy → Manage deployments → edit → new version) if you ever change the script.

## 3. Local run

```
cp .env.example .env      # paste the /exec URL and pick a results key
npm install
npm run dev
```

## 4. Deploy on GitHub Pages

1. Create an empty repo on GitHub and push this folder to its `master` branch.
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. Repo → Settings → Secrets and variables → Actions:
   - Variables tab → New repository variable `VITE_SHEET_ENDPOINT` = your `/exec` URL.
   - Secrets tab → New repository secret `VITE_RESULTS_KEY` = your results key.
4. Push again (or Actions → "Deploy to GitHub Pages" → Run workflow).

The site appears at `https://<user>.github.io/<repo>/` after a minute or two.
Every push to `master` redeploys. `.github/workflows/deploy.yml` sets the base path
to `/<repo>/` automatically; nothing to configure.

Cloudflare Pages also works (framework preset Vite, output `dist`, same two env vars).

## 5. Reading results

Open `https://<your-site>/?results=<VITE_RESULTS_KEY>`, download both sheet tabs as
CSV and paste them in. You get exposures, clicks, click rate, and a Plackett-Luce
strength per thumbnail (with a bootstrap range), filterable by age, platform and
whether the person plays EH. Or just take the CSVs into Claude.

Reading tips:
- Overlapping 90% ranges are not distinguishable yet — collect more or treat them as a tier.
- Use "ignore clicks faster than" ≈ 400 ms to drop mashed taps.
- Click rate is out of 8 per screen, so 12.5% is average. Strength is the better column to sort by.

### Spotting spam

Every row carries a `device` id (random, kept in the browser's localStorage) and the
respondent's public `ip` (looked up client-side from ipify; blank if that failed).
To purge someone, filter the `grids` tab by their `device` or `ip` and delete the
rows, then do the same in `sessions`. One person legitimately doing the test twice
shows up the same way, so check the timestamps before deleting.

If you added these columns after the Sheet already had data, re-deploy the Apps
Script as a new version; the script fills in the missing headers on the next write.

## Tweaks

`src/config.ts`: grids per person, tiles per grid, fake names, fake player-count and
rating bands, results key. Fake names are reassigned randomly on every grid so no
name is tied to a thumbnail.
