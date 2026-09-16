import { useState } from "react";
import type { AgeBand, Platform } from "../types";

interface Props {
  onSubmit: (d: { age: AgeBand; platform: Platform; playsEH: boolean }) => void;
}

const AGES: { v: AgeBand; label: string }[] = [
  { v: "under13", label: "Under 13" },
  { v: "13to17", label: "13 to 17" },
  { v: "18plus", label: "18 or older" },
];
const PLATFORMS: { v: Platform; label: string }[] = [
  { v: "mobile", label: "Phone or tablet" },
  { v: "pc", label: "PC or Mac" },
  { v: "console", label: "Console" },
];

export function Demographics({ onSubmit }: Props) {
  const [age, setAge] = useState<AgeBand | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [playsEH, setPlaysEH] = useState<boolean | null>(null);
  const ready = age && platform && playsEH !== null;

  return (
    <div className="panel">
      <h1>Three quick questions</h1>
      <p className="muted">We don't ask for your name or account. This only helps us group the answers.</p>

      <fieldset>
        <legend>How old are you?</legend>
        <div className="choices">
          {AGES.map((a) => (
            <button
              key={a.v}
              className={"choice" + (age === a.v ? " on" : "")}
              onClick={() => setAge(a.v)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Where do you mostly play Roblox?</legend>
        <div className="choices">
          {PLATFORMS.map((p) => (
            <button
              key={p.v}
              className={"choice" + (platform === p.v ? " on" : "")}
              onClick={() => setPlatform(p.v)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Do you currently play Emergency Hamburg?</legend>
        <div className="choices">
          <button className={"choice" + (playsEH === true ? " on" : "")} onClick={() => setPlaysEH(true)}>
            Yes
          </button>
          <button className={"choice" + (playsEH === false ? " on" : "")} onClick={() => setPlaysEH(false)}>
            No
          </button>
        </div>
      </fieldset>

      <button
        className="primary"
        disabled={!ready}
        onClick={() => ready && onSubmit({ age: age!, platform: platform!, playsEH: playsEH! })}
      >
        Finish
      </button>
    </div>
  );
}

export function ThankYou() {
  return (
    <div className="panel center">
      <h1>Thanks, that's everything.</h1>
      <p className="muted">You can close this tab.</p>
    </div>
  );
}
