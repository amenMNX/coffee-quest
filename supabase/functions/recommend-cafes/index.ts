import { createOpenAI } from "npm:@ai-sdk/openai@2";
import { streamText } from "npm:ai@5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);

    const { drink, atmosphere, location, shops } = await req.json();
    if (!Array.isArray(shops) || shops.length === 0) {
      return json({ error: "No cafés to choose from." }, 400);
    }
    if (![drink, atmosphere, location].some((v) => typeof v === "string" && v.trim())) {
      return json({ error: "Tell us at least one preference." }, 400);
    }

    let runId: string | undefined;
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: async (input, init) => {
        const headers = new Headers(init?.headers);
        if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
        const res = await fetch(input, { ...init, headers });
        runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
        if (!res.ok) {
          const text = await res.clone().text();
          throw Object.assign(new Error(text), { status: res.status });
        }
        return res;
      },
    });

    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system:
        "You are a friendly coffee concierge. Pick the best matching cafés ONLY from the provided list. " +
        'Reply with JSON only, no markdown: {"recommendations":[{"id":"<shop id>","reason":"<one short sentence>"}]}. ' +
        "Return 1 to 3 picks, best first. Keep each reason under 25 words.",
      prompt:
        `Visitor preferences:\n- Drink: ${drink || "any"}\n- Atmosphere: ${atmosphere || "any"}\n- Location: ${location || "any"}\n\n` +
        `Cafés (JSON):\n${JSON.stringify(shops)}`,
      abortSignal: req.signal,
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    const text = await result.text;
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : { recommendations: [] };
    const ids = new Set(shops.map((s: { id: string }) => s.id));
    const recommendations = (parsed.recommendations ?? [])
      .filter((r: { id: string }) => ids.has(r.id))
      .slice(0, 3);
    return json({ recommendations });
  } catch (e) {
    const status = (e as { status?: number }).status ?? (e as { cause?: { status?: number } }).cause?.status;
    console.error("recommend-cafes error", status, e);
    if (status === 429) return json({ error: "Too many requests — please try again in a moment." }, 429);
    if (status === 402) return json({ error: "AI credits are used up. Add credits in workspace billing settings." }, 402);
    if (status === 403) return json({ error: "AI access is blocked for this workspace." }, 403);
    return json({ error: "Couldn't get recommendations right now." }, 500);
  }
});
