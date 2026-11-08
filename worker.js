// Cloudflare Worker — keep OPENROUTER_API_KEY as a Worker Secret.
// Add a secret named OPENROUTER_API_KEY in Cloudflare.
// Set MODEL as a Worker variable later; this default is an example model identifier.
const MODEL = "openai/gpt-4o-mini";

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    if (url.pathname !== "/api/chat" || request.method !== "POST") {
      return new Response("G-AI API is running", { headers: cors });
    }
    if (!env.OPENROUTER_API_KEY) {
      return Response.json({ error: "API key is not configured on the server." }, { status: 500, headers: cors });
    }

    try {
      const body = await request.json();
      if (!Array.isArray(body.messages) || body.messages.length === 0) {
        return Response.json({ error: "Messages are required." }, { status: 400, headers: cors });
      }

      const messages = body.messages.slice(-20).map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "").slice(0, 12000)
      }));

      const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://example.com",
          "X-Title": "G-AI"
        },
        body: JSON.stringify({ model: MODEL, messages, temperature: 0.7 })
      });

      const result = await upstream.json();
      if (!upstream.ok) {
        return Response.json({ error: result.error?.message || "AI provider request failed." }, { status: upstream.status, headers: cors });
      }
      const reply = result.choices?.[0]?.message?.content;
      return Response.json({ reply: typeof reply === "string" ? reply : "لم يصل نص من النموذج." }, { headers: cors });
    } catch (error) {
      return Response.json({ error: "Server error: " + error.message }, { status: 500, headers: cors });
    }
  }
};
