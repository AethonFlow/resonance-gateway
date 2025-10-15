import { callAI } from "./_ai.mjs";
import { readJSON, writeJSON } from "./_memory.mjs";

export default async (req) => {
  const body = req.body ? JSON.parse(req.body) : {};
  const { cycleId, topic = "Student Weinkontor" } = body;
  if (!cycleId) return new Response(JSON.stringify({ ok:false, error:"cycleId required" }), { status:400 });

  const wnw = await readJSON(`cycles/${cycleId}/WNW.json`, { metrics:{}, suggestions:[] });
  const ono = await readJSON(`cycles/${cycleId}/ONO.json`, { house:"ONO", backlog:[] });

  const system = "You are ONO (Product Development & Love). Turn backlog + analytics into concrete product decisions with rationale and priority.";
  const prompt = `Topic: ${topic}
Backlog (from WSW/WNW): ${JSON.stringify(ono.backlog || [], null, 2)}
Analytics (WNW): ${JSON.stringify(wnw.metrics || {}, null, 2)}

Deliver strict JSON:
{
  "decisions":[
    {
      "title":"short action (e.g. 'Merlot → tall bottle + minimalist label')",
      "why":"short rationale linking to signals/metrics",
      "priority":"P1|P2|P3",
      "spec":{"variant?":"...", "packaging?":"...", "label?":"...", "bundle?":"..."}
    }
  ],
  "next_batch":[ "short next tasks for WSW / WNW to validate", "..." ]
}
`;

  const out = await callAI({ model: "gpt-5-reasoning", system, prompt });

  let data;
  try { data = out.text ? JSON.parse(out.text) : out; } catch { data = { raw: out }; }

  // Persist back into ONO.json
  const updated = {
    ...ono,
    decisions: data.decisions || [],
    next_batch: data.next_batch || [],
    ts: Date.now()
  };
  await writeJSON(`cycles/${cycleId}/ONO.json`, updated);

  // Ledger update
  const ledger = (await readJSON(`cycles/${cycleId}/ledger.json`, { id: cycleId, phase: "init", houses: [], t0: Date.now() }));
  if (!ledger.houses.includes("ONO")) ledger.houses.push("ONO");
  await writeJSON(`cycles/${cycleId}/ledger.json`, ledger);

  return new Response(JSON.stringify({ ok:true, cycleId, result: updated }), { status:200 });
};

export const config = { path: "/.netlify/functions/house-ono" };
