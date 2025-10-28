// netlify/functions/_memory.mjs
// Storage helper: bevorzugt Netlify Blobs, Fallback = In-Memory (lokale Dev)

let MEM = new Map(); // key -> stringified JSON (nur Fallback)

async function getStore() {
  try {
    const { getStore } = await import('@netlify/blobs');
    // Ein Store-Name (Namespace) für alle Cycles:
    return getStore('cycles');
  } catch {
    return null; // Fallback in MEM-Map
  }
}

export async function readJSON(key, defaultValue = null) {
  const store = await getStore();
  if (store) {
    const obj = await store.get(key, { type: 'json' });
    return obj ?? defaultValue;
  }
  // Fallback
  if (!MEM.has(key)) return defaultValue;
  try {
    return JSON.parse(MEM.get(key));
  } catch {
    return defaultValue;
  }
}

export async function writeJSON(key, value) {
  const store = await getStore();
  const payload = JSON.stringify(value);
  if (store) {
    await store.set(key, payload, { contentType: 'application/json' });
    return true;
  }
  MEM.set(key, payload);
  return true;
}

export async function listKeys(prefix = '') {
  const store = await getStore();
  if (store) {
    const out = await store.list({ prefix });
    return (out.blobs || []).map((b) => b.key);
  }
  // Fallback
  return [...MEM.keys()].filter((k) => k.startsWith(prefix));
}

// ---------------------------------------------------------------------------
// 🔹 Ergänzung: ID-Generator für neue Zyklen
// ---------------------------------------------------------------------------

// interne Hilfsfunktion: Zeit + Zufalls-Suffix
function _genId() {
  const t = new Date().toISOString().replace(/[:.]/g, '-');
  const r = Math.random().toString(36).slice(2, 8);
  return `${t}_${r}`;
}

/**
 * Liefert eine neue, noch unbenutzte Cycle-ID.
 * Prüft per readJSON, ob cycles/<id>/ledger.json existiert; falls ja, neu würfeln.
 */
export async function newCycleId() {
  for (let i = 0; i < 5; i++) {
    const id = _genId();
    const exists = await readJSON(`cycles/${id}/ledger.json`, null);
    if (!exists) return id;
  }
  // Fallback: gibt notfalls eine zufällige ID zurück
  return _genId();
}
