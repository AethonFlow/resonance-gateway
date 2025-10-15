import { getStore } from "@netlify/blobs";
const store = getStore({ name: "resonance-memory" });

export async function readJSON(key, fallback = null) {
  try { const r = await store.get(key); return r ? await r.json() : fallback; }
  catch { return fallback; }
}
export async function writeJSON(key, data) {
  await store.setJSON(key, data);
  return data;
}
export function newCycleId() {
  return "c" + Math.random().toString(36).slice(2, 10);
}
