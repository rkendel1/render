import { generateText } from "ai";
import { buildSystemPrompt } from "@/lib/prompt";

const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt, startingSpec } = (await req.json()) as {
    prompt: string;
    startingSpec?: Record<string, unknown> | null;
  };

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt();

  let userPrompt = prompt;
  if (startingSpec) {
    userPrompt = `Use the following spec as a starting point and modify it according to my instructions.\n\nSTARTING SPEC:\n${JSON.stringify(startingSpec, null, 2)}\n\nINSTRUCTIONS:\n${prompt}`;
  }

  const { text } = await generateText({
    model: process.env.AI_MODEL ?? DEFAULT_MODEL,
    system: systemPrompt,
    prompt: userPrompt,
  });

  let spec: Record<string, unknown>;
  try {
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    spec = JSON.parse(cleaned);
  } catch {
    return Response.json(
      { error: "Failed to parse AI response as JSON", raw: text },
      { status: 500 },
    );
  }

  return Response.json({ spec });
}
