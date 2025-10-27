// netlify/functions/core-963.js
// Central resonance helper: gentle pull toward 963 Hz (Integration Core)
export function corePull({xA, vA, xB, vB}, strength = 0.002) {
  // Pull both oscillators toward phase alignment (x≈0, v≈0) — the "null point"
  vA -= strength * xA;
  vB -= strength * xB;
  // slight velocity damping to help re-center without killing energy
  const damp = 1 - strength*0.5;
  vA *= damp; vB *= damp;
  return {xA, vA, xB, vB};
}

export function complementBonus(aId, bId, fields){
  const A = fields.find(f=>f.id===aId); const B = fields.find(f=>f.id===bId);
  if(!A||!B) return 0;
  return (A.complement===B.id || B.complement===A.id) ? 0.15 : 0.0;
}
