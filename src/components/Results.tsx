import { useMemo, useState } from "react";

interface GridRow {
  session: string;
  shown: string[];
  clicked: string;
  ms: number;
}
interface SessionRow {
  session: string;
  age: string;
  platform: string;
  playsEH: string;
}

/** Minimal CSV parser (handles quoted fields with commas). */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x !== ""));
}

function toObjects(rows: string[][]): Record<string, string>[] {
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), r[i] ?? ""])));
}

/**
 * Plackett-Luce strengths via the MM algorithm (Hunter 2004) for
 * multi-way choices. Each grid is one choice among the tiles shown.
 */
function plackettLuce(grids: GridRow[], items: string[], iters = 200) {
  const idx = new Map(items.map((x, i) => [x, i]));
  const n = items.length;
  const wins = new Array(n).fill(0);
  for (const g of grids) {
    const k = idx.get(g.clicked);
    if (k !== undefined) wins[k]++;
  }
  let s = new Array(n).fill(1);
  for (let t = 0; t < iters; t++) {
    const denom = new Array(n).fill(0);
    for (const g of grids) {
      let tot = 0;
      for (const x of g.shown) tot += s[idx.get(x) ?? 0];
      for (const x of g.shown) denom[idx.get(x) ?? 0] += 1 / tot;
    }
    const next = s.map((_, i) => (denom[i] > 0 ? (wins[i] + 0.5) / denom[i] : 0));
    const mean = next.reduce((a, b) => a + b, 0) / n;
    s = next.map((v) => v / mean);
  }
  return s;
}

function bootstrap(grids: GridRow[], items: string[], reps = 150) {
  const samples: number[][] = [];
  for (let r = 0; r < reps; r++) {
    const g = Array.from({ length: grids.length }, () => grids[Math.floor(Math.random() * grids.length)]);
    samples.push(plackettLuce(g, items, 60));
  }
  return items.map((_, i) => {
    const v = samples.map((s) => s[i]).sort((a, b) => a - b);
    return [v[Math.floor(v.length * 0.05)], v[Math.floor(v.length * 0.95)]];
  });
}

export function Results() {
  const [gridsCsv, setGridsCsv] = useState("");
  const [sessionsCsv, setSessionsCsv] = useState("");
  const [age, setAge] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [playsEH, setPlaysEH] = useState("all");
  const [minMs, setMinMs] = useState(0);

  const grids = useMemo<GridRow[]>(() => {
    if (!gridsCsv.trim()) return [];
    return toObjects(parseCSV(gridsCsv)).map((o) => ({
      session: o.session,
      shown: o.shown.split("|"),
      clicked: o.clicked,
      ms: Number(o.ms),
    }));
  }, [gridsCsv]);

  const sessions = useMemo<Map<string, SessionRow>>(() => {
    const m = new Map<string, SessionRow>();
    if (!sessionsCsv.trim()) return m;
    for (const o of toObjects(parseCSV(sessionsCsv)))
      m.set(o.session, { session: o.session, age: o.age, platform: o.platform, playsEH: o.playsEH });
    return m;
  }, [sessionsCsv]);

  const filtered = useMemo(() => {
    return grids.filter((g) => {
      if (g.ms < minMs) return false;
      const s = sessions.get(g.session);
      if (age !== "all" && s?.age !== age) return false;
      if (platform !== "all" && s?.platform !== platform) return false;
      if (playsEH !== "all" && s?.playsEH !== playsEH) return false;
      return true;
    });
  }, [grids, sessions, age, platform, playsEH, minMs]);

  const table = useMemo(() => {
    if (!filtered.length) return [];
    const items = Array.from(new Set(filtered.flatMap((g) => g.shown))).sort();
    const s = plackettLuce(filtered, items);
    const ci = bootstrap(filtered, items);
    const exposures = new Map<string, number>();
    const clicks = new Map<string, number>();
    for (const g of filtered) {
      for (const x of g.shown) exposures.set(x, (exposures.get(x) ?? 0) + 1);
      clicks.set(g.clicked, (clicks.get(g.clicked) ?? 0) + 1);
    }
    return items
      .map((id, i) => ({
        id,
        exposures: exposures.get(id) ?? 0,
        clicks: clicks.get(id) ?? 0,
        share: (clicks.get(id) ?? 0) / (exposures.get(id) ?? 1),
        strength: s[i],
        lo: ci[i][0],
        hi: ci[i][1],
      }))
      .sort((a, b) => b.strength - a.strength);
  }, [filtered]);

  return (
    <div className="panel wide">
      <h1>Results</h1>
      <p className="muted">
        Paste the two sheets (File → Download → CSV) below. Everything is computed in your browser.
      </p>
      <div className="two">
        <label>
          grids sheet
          <textarea value={gridsCsv} onChange={(e) => setGridsCsv(e.target.value)} placeholder="Paste grids CSV" />
        </label>
        <label>
          sessions sheet
          <textarea value={sessionsCsv} onChange={(e) => setSessionsCsv(e.target.value)} placeholder="Paste sessions CSV" />
        </label>
      </div>

      <div className="filters">
        <label>
          Age
          <select value={age} onChange={(e) => setAge(e.target.value)}>
            <option value="all">All</option>
            <option value="under13">Under 13</option>
            <option value="13to17">13 to 17</option>
            <option value="18plus">18+</option>
          </select>
        </label>
        <label>
          Platform
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="all">All</option>
            <option value="mobile">Mobile</option>
            <option value="pc">PC</option>
            <option value="console">Console</option>
          </select>
        </label>
        <label>
          Plays EH
          <select value={playsEH} onChange={(e) => setPlaysEH(e.target.value)}>
            <option value="all">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Ignore clicks faster than (ms)
          <input type="number" value={minMs} min={0} step={100} onChange={(e) => setMinMs(Number(e.target.value))} />
        </label>
      </div>

      {filtered.length > 0 && (
        <>
          <p>
            {filtered.length} grids from {new Set(filtered.map((g) => g.session)).size} people.
          </p>
          <table>
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Shown</th>
                <th>Clicked</th>
                <th>Click rate</th>
                <th>Strength</th>
                <th>90% range</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r) => (
                <tr key={r.id}>
                  <td>
                    <img className="mini" src={`${import.meta.env.BASE_URL}thumbs/${r.id}.webp`} alt="" />
                    {r.id}
                  </td>
                  <td>{r.exposures}</td>
                  <td>{r.clicks}</td>
                  <td>{(r.share * 100).toFixed(1)}%</td>
                  <td>{r.strength.toFixed(2)}</td>
                  <td>
                    {r.lo.toFixed(2)} – {r.hi.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted">
            Strength is a Plackett-Luce estimate: 2.0 means a tile is clicked about twice as often as an average
            tile when shown together. Ranges are bootstrap 90% intervals; overlapping ranges are not distinguishable yet.
          </p>
        </>
      )}
    </div>
  );
}
