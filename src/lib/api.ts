import { SHEET_ENDPOINT } from "../config";
import type { GridRecord, SessionRecord } from "../types";

/**
 * Sends a row to the Apps Script web app. Body is sent as text/plain so the
 * browser does not send a CORS preflight (Apps Script cannot answer one).
 * Fire-and-forget; failures are logged but never block the respondent.
 */
async function post(type: "grid" | "session", payload: GridRecord | SessionRecord) {
  if (!SHEET_ENDPOINT) {
    console.warn("[thumbtest] VITE_SHEET_ENDPOINT not set; row not sent:", type, payload);
    return;
  }
  try {
    await fetch(SHEET_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ type, ...payload }),
      keepalive: true,
    });
  } catch (err) {
    console.error("[thumbtest] failed to send row", err);
  }
}

export const sendGrid = (r: GridRecord) => post("grid", r);
export const sendSession = (r: SessionRecord) => post("session", r);

/**
 * A random id stored in localStorage so repeat runs from the same browser can
 * be linked (and purged) even if the IP changes. Empty if storage is blocked.
 */
export function deviceId(): string {
  try {
    const k = "thumbtest.device";
    let v = localStorage.getItem(k);
    if (!v) {
      v = newSessionId();
      localStorage.setItem(k, v);
    }
    return v;
  } catch {
    return "";
  }
}

/** Public IP via ipify. Resolves to "" on any failure or after 3 s. */
export async function lookupIp(): Promise<string> {
  try {
    const r = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(3000) });
    const j = await r.json();
    return typeof j.ip === "string" ? j.ip : "";
  } catch {
    return "";
  }
}

export function newSessionId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}
