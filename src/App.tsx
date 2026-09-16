import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { GRIDS_PER_SESSION, RESULTS_KEY, TILES_PER_GRID } from "./config";
import { Demographics, ThankYou } from "./components/Demographics";
import { Results } from "./components/Results";
import { Tile } from "./components/Tile";
import { deviceId, lookupIp, newSessionId, sendGrid, sendSession } from "./lib/api";
import { buildSessionGrids } from "./lib/grids";
import type { ManifestEntry, Tile as TileT } from "./types";

type Stage = "loading" | "intro" | "grids" | "questions" | "done" | "error";

/** Fade duration between grids. Clicks are ignored until the next grid has fully faded in. */
const FADE_MS = 220;

export default function App() {
  const params = new URLSearchParams(location.search);
  if (RESULTS_KEY && params.get("results") === RESULTS_KEY)
    return (
      <Boundary>
        <Results />
      </Boundary>
    );
  return <Survey />;
}

/** Shows a render error on screen instead of a blank page. */
class Boundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: "" };
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? `${e.message}
${e.stack ?? ""}` : String(e) };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="panel wide">
        <h1>Results page crashed</h1>
        <p className="muted">Reload the page and try again. If it keeps happening, send this:</p>
        <pre className="err">{this.state.error}</pre>
      </div>
    );
  }
}

function Survey() {
  const [stage, setStage] = useState<Stage>("loading");
  const [error, setError] = useState("");
  const [grids, setGrids] = useState<TileT[][]>([]);
  const [i, setI] = useState(0);
  const [hidden, setHidden] = useState(false); // row is fading out
  const [locked, setLocked] = useState(true); // ignore clicks during transitions
  const session = useMemo(newSessionId, []);
  const device = useMemo(deviceId, []);
  const ip = useRef("");
  const shownAt = useRef(0);

  useEffect(() => {
    lookupIp().then((v) => (ip.current = v));
    fetch(`${import.meta.env.BASE_URL}thumbs/manifest.json`)
      .then((r) => {
        if (!r.ok || !(r.headers.get("content-type") ?? "").includes("json")) {
          throw new Error(
            'No thumbnails found. Put images in raw-images/ and run "npm run prepare-images", then reload.',
          );
        }
        return r.json();
      })
      .then((images: ManifestEntry[]) => {
        if (images.length < TILES_PER_GRID) {
          throw new Error(
            `Need at least ${TILES_PER_GRID} images in public/thumbs; found ${images.length}. ` +
              `Run "npm run prepare-images".`,
          );
        }
        setGrids(buildSessionGrids(images));
        setStage("intro");
      })
      .catch((e) => {
        setError(String(e.message ?? e));
        setStage("error");
      });
  }, []);

  // Preload the next grid's images so the click timer is fair.
  useEffect(() => {
    const next = grids[i + 1];
    if (next) for (const t of next) new Image().src = t.src;
  }, [grids, i]);

  // A new grid has mounted: let it fade in, then start the timer and accept clicks.
  useEffect(() => {
    if (stage !== "grids") return;
    const t = window.setTimeout(() => {
      shownAt.current = performance.now();
      setLocked(false);
    }, FADE_MS);
    return () => window.clearTimeout(t);
  }, [stage, i]);

  function pick(pos: number) {
    if (locked) return;
    setLocked(true);
    setHidden(true);
    const grid = grids[i];
    const t = grid[pos];
    sendGrid({
      session,
      device,
      ip: ip.current,
      grid: i + 1,
      shown: grid.map((x) => x.id),
      names: grid.map((x) => x.name),
      clicked: t.id,
      clickedPos: pos,
      ms: Math.round(performance.now() - shownAt.current),
    });
    window.setTimeout(() => {
      setHidden(false);
      if (i + 1 < grids.length) setI(i + 1);
      else setStage("questions");
    }, FADE_MS);
  }

  if (stage === "loading") return <div className="panel center muted">Loading…</div>;
  if (stage === "error") return <div className="panel center"><p className="err">{error}</p></div>;

  if (stage === "intro")
    return (
      <div className="panel center">
        <h1>Which game would you play?</h1>
        <p>
          You'll see {GRIDS_PER_SESSION} screens that look like the Roblox home page.
          On each one, tap the game you'd open first. Don't think about it, just go with your gut.
        </p>
        <p className="muted">Takes about a minute. Three quick questions at the end.</p>
        <button className="primary" onClick={() => setStage("grids")}>
          Start
        </button>
      </div>
    );

  if (stage === "questions")
    return (
      <Demographics
        onSubmit={(d) => {
          sendSession({
            session,
            device,
            ip: ip.current,
            ...d,
            gridsCompleted: grids.length,
            userAgent: navigator.userAgent,
          });
          setStage("done");
        }}
      />
    );

  if (stage === "done") return <ThankYou />;

  const grid = grids[i];
  return (
    <div className="home">
      <div className="home-top">
        <span className="home-title">Recommended for you</span>
        <span className="home-progress">
          {i + 1} / {grids.length}
        </span>
      </div>
      <div className={hidden ? "row hidden" : "row"} key={i}>
        {grid.map((t, pos) => (
          <Tile key={t.id} tile={t} onClick={() => pick(pos)} />
        ))}
      </div>
    </div>
  );
}
