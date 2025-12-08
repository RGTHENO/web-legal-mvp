/**
 * Typed API client for LexVisual backend.
 */

import type { DocumentInfo, HealthResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** API error with status code */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Generic fetch wrapper with error handling */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.detail || `Request failed with status ${response.status}`,
        response.status,
        errorData.code
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0
    );
  }
}

/** Check API health status */
export async function checkHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}

/** Get list of indexed documents */
export async function getDocuments(): Promise<DocumentInfo[]> {
  return apiFetch<DocumentInfo[]>("/documents");
}

/** Delete a document */
export async function deleteDocument(documentId: string): Promise<void> {
  await apiFetch(`/documents/${documentId}`, { method: "DELETE" });
}

/** Upload document - returns SSE stream URL */
export function getUploadStreamUrl(): string {
  return `${API_URL}/api/documents/upload`;
}

/** Query documents - returns SSE stream URL */
export function getQueryStreamUrl(): string {
  return `${API_URL}/api/query`;
}

