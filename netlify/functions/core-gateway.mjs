import { callAI } from "./_ai.mjs";
import { readJSON, writeJSON } from "./_memory.mjs";

export default async (req) => {
  const body = req.body ? JSON.parse(req.body) : {};
  const { cycleId } = body;
  if (!cycleId) return new Response(JSON.stringify({ ok: false, error: "cycleId required" }), { status: 400 });

  const houses = ["WSW", "WNW"]; // extend later
  const inputs = [];
  for (const h of houses) {
    const r = await readJSON(`cycles/${cycleId}/${h}.json`, null);
    if (r) inputs.push({ house: h, output: r });
  }

  const system = "You are ANANKE (Integration Core). Synthesize house outputs into insight + next actions.";
  const prompt = `Synthesize into:
- 1 paragraph insight
- 4 bullet action plan
- 1 risk, 1 opportunity
DATA:\n${JSON.stringify(inputs, null, 2)}`;

  const out = await callAI({ model: "gpt-5-reasoning", system, prompt });
  const synthesis = out.text || JSON.stringify(out);

  const core = { cycleId, synthesis, ts: Date.now() };
  await writeJSON(`cycles/${cycleId}/core.json`, core);

  const global = (await readJSON("memory/global.json", { lastCycles: [] }));
  global.lastCycles = [cycleId, ...global.lastCycles.filter(id => id !== cycleId)].slice(0, 10);
  await writeJSON("memory/global.json", global);

  return new Response(JSON.stringify({ ok: true, core }), { status: 200 });
};
export const config = { path: "/.netlify/functions/core-gateway" };
