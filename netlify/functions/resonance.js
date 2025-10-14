export async function handler(event) {
  try {
    const { houseA = "NNO", houseB = "ONO" } = event.queryStringParameters || {};
    const houses = ["NNO","ONO","OSO","SSO","SSW","WSW","WNW","NNW"];
    const idxA = houses.indexOf(houseA), idxB = houses.indexOf(houseB);
    const areNeighbors = (idxA>-1&&idxB>-1) && (Math.abs(idxA-idxB)===1 || Math.abs(idxA-idxB)===houses.length-1);
    const areComplements = (idxA>-1&&idxB>-1) && ((idxA+4)%houses.length===idxB);

    const nodes = [
      { id: houseA, role: "source" },
      { id: houseB, role: "target" },
      { id: "CORE", role: "integration-core" }
    ];
    const edges = [
      { from: houseA, to: "CORE", type: "coupling" },
      { from: "CORE", to: houseB, type: "coupling" },
      { from: houseA, to: houseB, type: areComplements ? "complement" : (areNeighbors ? "neighbor" : "neutral") }
    ];
    const resonance = areComplements ? "complement" : (areNeighbors ? "neighbor" : "neutral");
   const commentary = `Run = Cycle: ${houseA} → ${houseB}. Resonance: ${resonance}. CORE holds the field; no conducting, only coupling.`;


    return { statusCode:200, headers:{ "Content-Type":"application/json","Cache-Control":"no-store"},
      body: JSON.stringify({ nodes, edges, commentary }) };
  } catch (e) { return { statusCode:500, body: JSON.stringify({ error:String(e) })}; }
}
