// netlify/functions/save-cycle.mjs
import { readJSON, writeJSON, listKeys } from "./_memory.mjs";

export default async (req) => {
    if (req.method !== 'POST') {
        return json(405, { error: 'method not allowed' });
    }

    const body = await safeJson(req);
    if (!body) return json(400, { error: 'invalid json' });

    // Struktur aus app.js: { meta, events, summary, id? }
    const id = body.id || genId();

    const payload = {
        id,
        createdAt: new Date().toISOString(),
        meta: body.meta || {},
        events: body.events || [],
        summary: body.summary || {}
    };

    // Speichern unter cycles/<id>/ledger.json (oder summary)
    await writeJSON(`cycles/${id}/ledger.json`, payload);
    // Bequeme Einzel-Files (optional): core/WSW/WNW/ONO kannst du später füllen
    await writeJSON(`cycles/${id}/core.json`, { summary: payload.summary, meta: payload.meta });

    // Global-Index aktualisieren
    const global = await readJSON("memory/global.json", { lastCycles: [] });
    const last = new Set(global.lastCycles || []);
    last.add(id);
    const updated = { lastCycles: Array.from(last).sort() };
    await writeJSON("memory/global.json", updated);

    return json(200, { ok: true, id });
};

export const config = { path: "/.netlify/functions/save-cycle" };

// helpers
function json(status, obj) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
    });
}

async function safeJson(req) {
    try { return await req.json(); } catch { return null; }
}

function genId() {
    const t = new Date().toISOString().replace(/[:.]/g, "-");
    const r = Math.random().toString(36).slice(2, 8);
    return `${t}_${r}`;
}
