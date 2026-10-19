// Answers Pacely's "AI engineer" questions. The page sends { system, messages }
// built from its own numbers; this returns { text } or { error }.
// Needs ANTHROPIC_API_KEY set in the Netlify site's environment variables.
import Anthropic from "@anthropic-ai/sdk";

let client;
const MAX_CHARS = 60_000;

const reply = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return reply({ error: "Send questions with POST." }, 405);

  let body;
  try { body = await req.json(); } catch { return reply({ error: "The request was not valid JSON." }, 400); }
  const { system, messages } = body || {};
  const valid = Array.isArray(messages) && messages.length > 0 && messages.length <= 10 &&
    messages.every(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string") &&
    (system === undefined || typeof system === "string");
  if (!valid) return reply({ error: "The request needs a messages list of user and assistant text." }, 400);
  const size = (system || "").length + messages.reduce((n, m) => n + m.content.length, 0);
  if (size > MAX_CHARS) return reply({ error: "This session has too much data to send in one question." }, 413);

  if (!process.env.ANTHROPIC_API_KEY) return reply({ error: "AI is not set up on this site yet. Set ANTHROPIC_API_KEY in Netlify." }, 500);
  try {
    client ??= new Anthropic();
    // Server-side fallback: if Claude Opus 5.5 declines, the API retries on a suitable model.
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system,
      messages,
    });
    if (response.stop_reason === "refusal") return reply({ error: "Claude declined to answer this question. Try asking it another way." }, 422);
    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
    return reply({ text });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return reply({ error: "The AI key on this site is missing or wrong. Set ANTHROPIC_API_KEY in Netlify." }, 500);
    if (error instanceof Anthropic.RateLimitError) return reply({ error: "Too many requests right now. Wait a minute and try again." }, 429);
    if (error instanceof Anthropic.APIError) return reply({ error: "The AI service did not respond. Try again shortly." }, 502);
    return reply({ error: "Could not reach the AI service." }, 502);
  }
};
