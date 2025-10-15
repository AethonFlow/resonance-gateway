import { callAI } from "./_ai.mjs";
import { readJSON, writeJSON } from "./_memory.mjs";

export default async (req) => {
  const body = req.body ? JSON.parse(req.body) : {};
  const { cycleId } = body;
  if (!cycleId) return new Response(JSON.stringify({ ok: false, error: "cycleId required" }), { status: 400 });

  const wsw = await readJSON(`cycles/${cycleId}/WSW.json`, null);

  const system = "You are WNW (Sales Analytics). Summarize soft signals into light metrics and product suggestions for ONO.";
  const prompt = `Input: ${JSON.stringify(wsw)}
Deliver JSON:
{
  "metrics": {"lead_score":0..100, "top_channels":["..."], "weak_variants":["..."]},
  "suggestions": ["short actionable suggestion", "..."]
}`;

  const out = await callAI({ model: "gpt-5-reasoning", system, prompt });

  let data;
  try { data = out.text ? JSON.parse(out.text) : out; } catch { data = { raw: out }; }

  const result = { house: "WNW", input: "WSW", ...data };
  await writeJSON(`cycles/${cycleId}/WNW.json`, result);

  // Feed ONO backlog
  const ono = (await readJSON(`cycles/${cycleId}/ONO.json`, { house: "ONO", backlog: [] }));
  const adds = (result.suggestions || []).map(s => ({ type: "product-suggestion", item: s, src: "WNW" }));
  ono.backlog = [...adds, ...(ono.backlog || [])].slice(0, 40);
  await writeJSON(`cycles/${cycleId}/ONO.json`, ono);

  // Ledger
  const ledger = (await readJSON(`cycles/${cycleId}/ledger.json`, { id: cycleId, phase: "init", houses: [], t0: Date.now() }));
  if (!ledger.houses.includes("WNW")) ledger.houses.push("WNW");
  await writeJSON(`cycles/${cycleId}/ledger.json`, ledger);

  return new Response(JSON.stringify({ ok: true, cycleId, result }), { status: 200 });
};
export const config = { path: "/.netlify/functions/house-wnw" };
