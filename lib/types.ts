/**
 * TypeScript interfaces for LexVisual data structures.
 */

/** Document information returned from the API */
export interface DocumentInfo {
  id: string;
  filename: string;
  page_count: number;
  uploaded_at: string;
  indexed: boolean;
}

/** Visual citation with page image */
export interface Citation {
  page: number;
  score: number;
  image_base64: string;
  document_id: string;
}

/** SSE event types from the backend */
export type SSEEventType = "status" | "reasoning" | "citation" | "token" | "error" | "done";

/** Parsed SSE event */
export interface SSEEvent {
  event: SSEEventType;
  data: string | Citation | DocumentInfo;
}

/** Chat message in the conversation */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  status?: string;
  reasoning?: string;
  isStreaming?: boolean;
  timestamp: Date;
}

/** Query request to the backend */
export interface QueryRequest {
  query: string;
  document_id?: string;
}

/** API health check response */
export interface HealthResponse {
  status: string;
  gpu_available: boolean;
  gpu_name: string | null;
  model_loaded: boolean;
}

/** Stream state for the agent stream hook */
export interface StreamState {
  isLoading: boolean;
  error: string | null;
  status: string | null;
  reasoning: string | null;
  citations: Citation[];
  tokens: string;
  isComplete: boolean;
}

