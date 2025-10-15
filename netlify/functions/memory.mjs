import { readJSON } from "./_memory.mjs";

export default async (req) => {
  const url = new URL(req.url);
  const cycleId = url.searchParams.get("cycleId");

  if (!cycleId) {
    const global = await readJSON("memory/global.json", { lastCycles: [] });
    return new Response(JSON.stringify({ ok: true, global }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  }

  const houses = ["WSW", "WNW", "ONO", "core"];
  const data = {};
  for (const h of houses) {
    const key = h === "core" ? `cycles/${cycleId}/core.json`
                             : `cycles/${cycleId}/${h}.json`;
    data[h] = await readJSON(key, null);
  }
  const ledger = await readJSON(`cycles/${cycleId}/ledger.json`, null);

  return new Response(JSON.stringify({ ok: true, cycleId, ledger, data }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
};

export const config = { path: "/.netlify/functions/memory" };
