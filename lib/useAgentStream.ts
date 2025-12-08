/**
 * Custom hook for handling Server-Sent Events (SSE) from the agent.
 * Provides robust error handling for stream interruptions.
 */

import { useState, useCallback, useRef } from "react";
import type { Citation, DocumentInfo, StreamState } from "./types";

interface UseAgentStreamOptions {
  onStatus?: (status: string) => void;
  onReasoning?: (reasoning: string) => void;
  onCitation?: (citation: Citation) => void;
  onToken?: (token: string) => void;
  onComplete?: (data?: DocumentInfo) => void;
  onError?: (error: string) => void;
}

interface UseAgentStreamReturn extends StreamState {
  startStream: (url: string, body?: FormData | string) => Promise<void>;
  stopStream: () => void;
  reset: () => void;
}

const initialState: StreamState = {
  isLoading: false,
  error: null,
  status: null,
  reasoning: null,
  citations: [],
  tokens: "",
  isComplete: false,
};

export function useAgentStream(
  options: UseAgentStreamOptions = {}
): UseAgentStreamReturn {
  const [state, setState] = useState<StreamState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.cancel().catch(() => {});
      readerRef.current = null;
    }
    setState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  const parseSSELine = useCallback(
    (line: string): { event: string; data: string } | null => {
      // SSE format: "event: type\ndata: payload\n\n"
      const eventMatch = line.match(/^event:\s*(.+)$/);
      const dataMatch = line.match(/^data:\s*(.+)$/);

      if (eventMatch) {
        return { event: eventMatch[1], data: "" };
      }
      if (dataMatch) {
        return { event: "", data: dataMatch[1] };
      }
      return null;
    },
    []
  );

  const startStream = useCallback(
    async (url: string, body?: FormData | string) => {
      // Cancel any existing stream
      stopStream();
      reset();

      setState((prev) => ({ ...prev, isLoading: true }));
      abortControllerRef.current = new AbortController();

      const isFormData = body instanceof FormData;
      const headers: HeadersInit = {};
      if (!isFormData && body) {
        headers["Content-Type"] = "application/json";
      }

      try {
        const response = await fetch(url, {
          method: "POST",
          headers,
          body,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP ${response.status}`);
        }

        if (!response.body) {
          throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();

        let buffer = "";
        let currentEvent = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setState((prev) => ({ ...prev, isLoading: false, isComplete: true }));
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages (separated by double newlines)
          const messages = buffer.split("\n\n");
          buffer = messages.pop() || ""; // Keep incomplete message in buffer

          for (const message of messages) {
            const lines = message.trim().split("\n");
            let eventType = "";
            let eventData = "";

            for (const line of lines) {
              if (line.startsWith("event:")) {
                eventType = line.slice(6).trim();
              } else if (line.startsWith("data:")) {
                // Don't trim - just remove the single space after "data:"
                const rawData = line.slice(5);
                eventData = rawData.startsWith(" ") ? rawData.slice(1) : rawData;
              }
            }

            if (!eventType || !eventData) continue;

            // Parse JSON data (backend always JSON encodes)
            let parsedData: unknown;
            try {
              parsedData = JSON.parse(eventData);
            } catch {
              parsedData = eventData; // Fallback to raw string
            }

            // Handle the event
            switch (eventType) {
              case "status":
                const statusStr = typeof parsedData === "string" ? parsedData : eventData;
                setState((prev) => ({ ...prev, status: statusStr }));
                options.onStatus?.(statusStr);
                break;

              case "reasoning":
                const reasoningStr = typeof parsedData === "string" ? parsedData : eventData;
                setState((prev) => ({ ...prev, reasoning: reasoningStr }));
                options.onReasoning?.(reasoningStr);
                break;

              case "citation":
                if (typeof parsedData === "object" && parsedData !== null) {
                  const citation = parsedData as Citation;
                  setState((prev) => ({
                    ...prev,
                    citations: [...prev.citations, citation],
                  }));
                  options.onCitation?.(citation);
                } else {
                  console.error("Failed to parse citation:", eventData);
                }
                break;

              case "token":
                const tokenStr = typeof parsedData === "string" ? parsedData : eventData;
                setState((prev) => ({
                  ...prev,
                  tokens: prev.tokens + tokenStr,
                }));
                options.onToken?.(tokenStr);
                break;

              case "error":
                const errorStr = typeof parsedData === "string" ? parsedData : eventData;
                setState((prev) => ({
                  ...prev,
                  error: errorStr,
                  isLoading: false,
                }));
                options.onError?.(errorStr);
                break;

              case "done":
                setState((prev) => ({
                  ...prev,
                  isLoading: false,
                  isComplete: true,
                }));
                if (typeof parsedData === "object" && parsedData !== null) {
                  options.onComplete?.(parsedData as DocumentInfo);
                } else {
                  options.onComplete?.();
                }
                break;
            }
          }
        }
      } catch (error) {
        // Handle abort (user cancelled)
        if (error instanceof Error && error.name === "AbortError") {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        // Handle other errors
        const errorMessage =
          error instanceof Error ? error.message : "Stream connection failed";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        options.onError?.(errorMessage);
      }
    },
    [stopStream, reset, options]
  );

  return {
    ...state,
    startStream,
    stopStream,
    reset,
  };
}

