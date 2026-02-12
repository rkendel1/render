import { agent } from "@/lib/agent";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { parseSpecStreamLine } from "@json-render/core";

export const maxDuration = 60;

/**
 * Creates a TransformStream that intercepts text-delta chunks from the
 * AI SDK's UI message stream and classifies content as either prose text
 * or JSONL patches:
 *
 * - Prose text is forwarded immediately (character-by-character streaming)
 * - Lines starting with `{` are buffered until complete, then classified:
 *   - Valid JSONL patch -> emitted as a data-jsonrender part
 *   - Not a patch -> flushed as text-delta
 *
 * All non-text chunks (tool events, step markers, etc.) pass through unchanged.
 */
function createJsonRenderTransform(): TransformStream<
  UIMessageChunk,
  UIMessageChunk
> {
  let lineBuffer = "";
  let currentTextId = "";
  // Whether the current incomplete line might be JSONL (starts with '{')
  let buffering = false;

  function flushBuffer(
    controller: TransformStreamDefaultController<UIMessageChunk>,
  ) {
    if (!lineBuffer) return;

    const trimmed = lineBuffer.trim();
    if (trimmed) {
      const patch = parseSpecStreamLine(trimmed);
      if (patch) {
        controller.enqueue({ type: "data-jsonrender", data: patch });
      } else {
        // Was buffered but isn't JSONL — flush as text
        controller.enqueue({
          type: "text-delta",
          id: currentTextId,
          delta: lineBuffer,
        });
      }
    } else {
      // Whitespace-only buffer — forward as-is (preserves blank lines)
      controller.enqueue({
        type: "text-delta",
        id: currentTextId,
        delta: lineBuffer,
      });
    }
    lineBuffer = "";
    buffering = false;
  }

  function processCompleteLine(
    line: string,
    controller: TransformStreamDefaultController<UIMessageChunk>,
  ) {
    const trimmed = line.trim();
    if (!trimmed) {
      // Empty line — forward for markdown paragraph breaks
      controller.enqueue({
        type: "text-delta",
        id: currentTextId,
        delta: "\n",
      });
      return;
    }

    const patch = parseSpecStreamLine(trimmed);
    if (patch) {
      controller.enqueue({ type: "data-jsonrender", data: patch });
    } else {
      controller.enqueue({
        type: "text-delta",
        id: currentTextId,
        delta: line + "\n",
      });
    }
  }

  return new TransformStream<UIMessageChunk, UIMessageChunk>({
    transform(chunk, controller) {
      switch (chunk.type) {
        case "text-start": {
          currentTextId = chunk.id;
          controller.enqueue(chunk);
          break;
        }

        case "text-delta": {
          currentTextId = chunk.id;
          const text = chunk.delta;

          for (let i = 0; i < text.length; i++) {
            const ch = text.charAt(i);

            if (ch === "\n") {
              // Line complete — classify and emit
              if (buffering) {
                // Finish the buffered potential-JSONL line
                processCompleteLine(lineBuffer, controller);
                lineBuffer = "";
                buffering = false;
              } else {
                // We've been streaming text character-by-character;
                // the newline itself just needs forwarding
                controller.enqueue({
                  type: "text-delta",
                  id: currentTextId,
                  delta: "\n",
                });
              }
            } else if (lineBuffer.length === 0 && !buffering) {
              // Start of a new line — decide whether to buffer or stream
              if (ch === "{") {
                // Might be JSONL — buffer until newline
                buffering = true;
                lineBuffer += ch;
              } else {
                // Definitely prose — forward immediately
                controller.enqueue({
                  type: "text-delta",
                  id: currentTextId,
                  delta: ch,
                });
              }
            } else if (buffering) {
              // Accumulating a potential JSONL line
              lineBuffer += ch;
            } else {
              // Continuing to stream prose text
              controller.enqueue({
                type: "text-delta",
                id: currentTextId,
                delta: ch,
              });
            }
          }
          break;
        }

        case "text-end": {
          flushBuffer(controller);
          controller.enqueue(chunk);
          break;
        }

        default: {
          controller.enqueue(chunk);
          break;
        }
      }
    },

    flush(controller) {
      flushBuffer(controller);
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const uiMessages: UIMessage[] = body.messages;

  if (!uiMessages || !Array.isArray(uiMessages) || uiMessages.length === 0) {
    return new Response(
      JSON.stringify({ error: "messages array is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Convert UIMessages (parts-based) to ModelMessages (content-based) for the agent
  const modelMessages = await convertToModelMessages(uiMessages);

  const result = await agent.stream({ messages: modelMessages });

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(
        result.toUIMessageStream().pipeThrough(createJsonRenderTransform()),
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
}
