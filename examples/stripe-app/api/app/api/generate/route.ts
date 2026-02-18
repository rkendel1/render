import { streamText } from "ai";
import { gateway } from "@ai-sdk/gateway";

export const maxDuration = 60;

const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

interface Spec {
  root: string;
  elements: Record<string, unknown>;
  state?: Record<string, unknown>;
}

interface JsonPatch {
  op: "add" | "replace" | "remove" | "move" | "copy" | "test";
  path: string;
  value?: unknown;
  from?: string;
}

function setSpecValue(spec: Spec, path: string, value: unknown): void {
  if (path === "/root") {
    spec.root = value as string;
    return;
  }
  if (path === "/state") {
    spec.state = value as Record<string, unknown>;
    return;
  }
  if (path.startsWith("/state/")) {
    if (!spec.state) spec.state = {};
    const key = path.slice("/state/".length);
    spec.state[key] = value;
    return;
  }
  const elemMatch = path.match(/^\/elements\/(.+)/);
  if (elemMatch) {
    spec.elements[elemMatch[1]] = value;
  }
}

function applyPatch(spec: Spec, patch: JsonPatch): Spec {
  switch (patch.op) {
    case "add":
    case "replace":
      setSpecValue(spec, patch.path, patch.value);
      break;
    case "remove":
      if (patch.path.startsWith("/elements/")) {
        const key = patch.path.slice("/elements/".length);
        delete spec.elements[key];
      }
      break;
  }
  return spec;
}

export async function POST(req: Request) {
  const { prompt, systemPrompt } = await req.json();

  if (!prompt) {
    return jsonResponse({ error: "prompt is required" }, 400);
  }

  try {
    const result = streamText({
      model: gateway(DEFAULT_MODEL),
      system: systemPrompt ?? "You are a helpful UI builder.",
      prompt,
      temperature: 0.7,
    });

    let spec: Spec = { root: "", elements: {} };
    let fullText = "";

    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    const lines = fullText.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//")) continue;
      try {
        const parsed = JSON.parse(trimmed) as JsonPatch;
        if (parsed.op) {
          spec = applyPatch(spec, parsed);
        }
      } catch {
        // skip non-JSON lines (prose, code fences, etc.)
      }
    }

    if (!spec.root) {
      return jsonResponse({ error: "AI did not produce a valid UI spec" }, 500);
    }

    return jsonResponse({ spec });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return jsonResponse({ error: message }, 500);
  }
}

export async function OPTIONS() {
  return new Response(null, { headers: CORS_HEADERS });
}
