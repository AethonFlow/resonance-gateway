import { callAI } from "./_ai.mjs";
import { readJSON, writeJSON, newCycleId } from "./_memory.mjs";

export default async (req) => {
  const body = req.body ? JSON.parse(req.body) : {};
  let { cycleId, topic = "Student Weinkontor", phase = "init" } = body;
  if (!cycleId) cycleId = newCycleId();

  const system = "You are WSW (Market & Mirror). In init phase, use soft signals (events, tastings, clicks).";
  const prompt = `Topic: ${topic}
Phase: ${phase}
Deliver JSON:
{
  "signals":[{"type":"tasting|booth|landing","label":"string","interest":0..1,"notes":"string"}],
  "channel_hypotheses":["string","string","string"]
}`;

  const out = await callAI({ model: "gpt-5-reasoning", system, prompt });

  let data;
  try { data = out.text ? JSON.parse(out.text) : out; } catch { data = { raw: out }; }

  const result = { house: "WSW", phase, topic, ...data };
  await writeJSON(`cycles/${cycleId}/WSW.json`, result);

  // Warm ONO backlog
  const ono = (await readJSON(`cycles/${cycleId}/ONO.json`, { house: "ONO", backlog: [] }));
  const hints = (result.channel_hypotheses || []).map(h => ({ type: "channel-hypothesis", item: h, src: "WSW" }));
  ono.backlog = [...hints, ...(ono.backlog || [])].slice(0, 30);
  await writeJSON(`cycles/${cycleId}/ONO.json`, ono);

  // Ledger
  const ledger = (await readJSON(`cycles/${cycleId}/ledger.json`, { id: cycleId, phase, houses: [], t0: Date.now() }));
  if (!ledger.houses.includes("WSW")) ledger.houses.push("WSW");
  await writeJSON(`cycles/${cycleId}/ledger.json`, ledger);

  return new Response(JSON.stringify({ ok: true, cycleId, result }), { status: 200 });
};
export const config = { path: "/.netlify/functions/house-wsw" };
