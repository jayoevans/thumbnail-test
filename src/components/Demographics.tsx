import { useState } from "react";
import type { AgeBand, EHRelation, Platform, RobloxFreq } from "../types";

export interface Answers {
  age: AgeBand;
  platform: Platform;
  eh: EHRelation;
  roblox: RobloxFreq;
}

interface Props {
  onSubmit: (d: Answers) => void;
}

export const AGES: { v: AgeBand; label: string }[] = [
  { v: "under13", label: "Under 13" },
  { v: "13to17", label: "13 to 17" },
  { v: "18plus", label: "18 or older" },
];
export const PLATFORMS: { v: Platform; label: string }[] = [
  { v: "mobile", label: "Phone or tablet" },
  { v: "pc", label: "PC or Mac" },
  { v: "console", label: "Console" },
];
export const ROBLOX_FREQS: { v: RobloxFreq; label: string }[] = [
  { v: "daily", label: "Most days" },
  { v: "monthly", label: "A few times a month" },
  { v: "rarely", label: "Rarely or never" },
];
export const EH_RELATIONS: { v: EHRelation; label: string }[] = [
  { v: "staff", label: "I work on it or test it" },
  { v: "regular", label: "I play it regularly" },
  { v: "played", label: "I've played it before" },
  { v: "never", label: "Never played it" },
];

function Choice<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { v: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="choices">
        {options.map((o) => (
          <button key={o.v} className={"choice" + (value === o.v ? " on" : "")} onClick={() => onChange(o.v)}>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Demographics({ onSubmit }: Props) {
  const [age, setAge] = useState<AgeBand | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [roblox, setRoblox] = useState<RobloxFreq | null>(null);
  const [eh, setEh] = useState<EHRelation | null>(null);
  const ready = age && platform && roblox && eh;

  return (
    <div className="panel">
      <h1>Four quick questions</h1>
      <p className="muted">We don't ask for your name or account. This only helps us group the answers.</p>

      <Choice legend="How old are you?" options={AGES} value={age} onChange={setAge} />
      <Choice legend="How often do you play Roblox?" options={ROBLOX_FREQS} value={roblox} onChange={setRoblox} />
      <Choice legend="Where do you mostly play Roblox?" options={PLATFORMS} value={platform} onChange={setPlatform} />
      <Choice
        legend="What's your relationship with Emergency Hamburg?"
        options={EH_RELATIONS}
        value={eh}
        onChange={setEh}
      />

      <button
        className="primary"
        disabled={!ready}
        onClick={() => ready && onSubmit({ age: age!, platform: platform!, roblox: roblox!, eh: eh! })}
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
