export async function callAI({ model, system, prompt }) {
  const url = process.env.NETLIFY_AI_GATEWAY_URL || process.env.AI_GATEWAY_URL;
  if (!url) {
    // Dev fallback: echo so you can test cycles without a real gateway
    return { text: JSON.stringify({ stub: true, model, system, prompt }) };
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model, system, prompt })
  });
  const json = await res.json().catch(() => ({}));
  return typeof json === "string" ? { text: json } : json;
}
