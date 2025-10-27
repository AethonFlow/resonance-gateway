// netlify/functions/resonance.js
import fields from "../../config/emergie_felder.json" assert { type: "json" };
import { corePull, complementBonus } from "./core-963.js";

export default async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const houseA = url.searchParams.get("houseA") || "NNO";
    const houseB = url.searchParams.get("houseB") || "SSW";

    const A = fields.find(f => f.id === houseA);
    const B = fields.find(f => f.id === houseB);
    if (!A || !B) return res.status(400).json({ error: "unknown house" });

    // Parameters (conservative defaults)
    const dt = 0.02;           // time step
    const gamma = 0.01;        // damping
    const k = 0.10;            // coupling strength
    const scale = 1/1200;      // frequency scaling to keep forces sane

    // State seeds — small opposite velocities show motion
    let xA = 0.00, vA = 0.12;
    let xB = 0.00, vB = -0.10;

    // Force with coupling
    const force = (xSelf, xOther, omegaHz) => {
      const w = 2*Math.PI*omegaHz*scale; // scaled rad/s
      return -(w*w)*xSelf - k*(xSelf - xOther);
    };

    // Velocity-Verlet step with gentle damping and core pull
    const step = () => {
      vA += 0.5*dt*force(xA, xB, A.frequency_hz);
      vB += 0.5*dt*force(xB, xA, B.frequency_hz);
      xA += dt*vA; xB += dt*vB;
      ({xA, vA, xB, vB} = corePull({xA, vA, xB, vB}, 0.002));
      vA += 0.5*dt*force(xA, xB, A.frequency_hz);
      vB += 0.5*dt*force(xB, xA, B.frequency_hz);
      vA *= (1-gamma); vB *= (1-gamma);
    };

    for (let i=0;i<400;i++) step();

    // Scores
    const phaseAlign = 1 - Math.min(1, Math.abs(xA - xB));
    const ampBalance = 1 - Math.min(1, Math.abs(Math.abs(xA) - Math.abs(xB)));
    let R = 0.6*phaseAlign + 0.4*ampBalance + complementBonus(A.id, B.id, fields);
    R = Math.max(0, Math.min(1, R));

    const type = (A.complement===B.id || B.complement===A.id) ? "complement" : "neighbor";

    return res.json({
      nodes: [ {id: A.id, role:"source"}, {id:"CORE"}, {id: B.id, role:"target"} ],
      edges: [ {from: A.id, to: B.id, type} ],
      resonance: Number(R.toFixed(3)),
      commentary: `Resonance ${A.id}↔${B.id} → ${R.toFixed(2)} (${type})`
    });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
