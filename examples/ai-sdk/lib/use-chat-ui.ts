"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Spec } from "@json-render/core";
import { parseSpecStreamLine, applySpecStreamPatch } from "@json-render/core";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  spec: Spec | null;
}

export interface UseChatUIOptions {
  api: string;
}

export interface UseChatUIReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: Error | null;
  send: (text: string) => Promise<void>;
  clear: () => void;
}

let nextId = 0;
function generateId(): string {
  return `msg-${Date.now()}-${nextId++}`;
}

export function useChatUI({ api }: UseChatUIOptions): UseChatUIReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Abort any existing request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        text: text.trim(),
        spec: null,
      };

      const assistantId = generateId();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        text: "",
        spec: null,
      };

      // Append both user message and empty assistant placeholder
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);
      setError(null);

      // Build the messages array to send (all previous + new user message)
      const historyForApi = [
        ...messages.map((m) => ({
          role: m.role,
          content: m.text,
        })),
        { role: "user" as const, content: text.trim() },
      ];

      try {
        const response = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyForApi }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          let errorMessage = `HTTP error: ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Ignore JSON parsing errors
          }
          throw new Error(errorMessage);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedText = "";
        let currentSpec: Spec = { root: "", elements: {} };
        let hasSpec = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const patch = parseSpecStreamLine(trimmed);
            if (patch) {
              // It's a JSONL patch line — apply to spec
              hasSpec = true;
              applySpecStreamPatch(
                currentSpec as unknown as Record<string, unknown>,
                patch,
              );
              // Update message with new spec state
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        spec: {
                          ...currentSpec,
                          elements: { ...currentSpec.elements },
                        },
                      }
                    : m,
                ),
              );
            } else {
              // It's a text line
              accumulatedText += (accumulatedText ? "\n" : "") + line;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, text: accumulatedText } : m,
                ),
              );
            }
          }
        }

        // Process remaining buffer
        if (buffer.trim()) {
          const trimmed = buffer.trim();
          const patch = parseSpecStreamLine(trimmed);
          if (patch) {
            hasSpec = true;
            applySpecStreamPatch(
              currentSpec as unknown as Record<string, unknown>,
              patch,
            );
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      spec: {
                        ...currentSpec,
                        elements: { ...currentSpec.elements },
                      },
                    }
                  : m,
              ),
            );
          } else {
            accumulatedText += (accumulatedText ? "\n" : "") + buffer;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, text: accumulatedText } : m,
              ),
            );
          }
        }

        // Final update to ensure spec has deep-copied elements
        if (hasSpec) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    spec: {
                      root: currentSpec.root || "",
                      elements: { ...currentSpec.elements },
                      ...(currentSpec.state
                        ? { state: { ...currentSpec.state } }
                        : {}),
                    },
                  }
                : m,
            ),
          );
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        // Remove the empty assistant message on error
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantId || m.text.length > 0),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [api, messages],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    messages,
    isStreaming,
    error,
    send,
    clear,
  };
}
