import { agent } from "@/lib/agent";

export const maxDuration = 60;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages: ChatMessage[] = body.messages;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "messages array is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const result = await agent.stream({
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  return result.toTextStreamResponse();
}
