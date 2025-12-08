"use client";

import { User, Bot, Loader2 } from "lucide-react";
import type { Message } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { CitationGrid } from "./VisualCitation";

interface ChatMessageProps {
  message: Message;
  documentNames?: Record<string, string>;
}

export function ChatMessage({ message, documentNames }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 animate-slide-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
          isUser 
            ? "bg-stone-100 border border-stone-200" 
            : "bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200/50 shadow-sm"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-stone-500" />
        ) : (
          <Bot className="w-4 h-4 text-indigo-600" />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", isUser ? "text-right" : "text-left")}>
        {/* Status/Reasoning indicators for assistant */}
        {!isUser && (message.status || message.reasoning) && (
          <div className="mb-3 space-y-1.5">
            {message.status && (
              <div className="flex items-center gap-2 text-xs text-stone-400">
                {message.isStreaming && (
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                )}
                <span>{message.status}</span>
              </div>
            )}
            {message.reasoning && (
              <div className="text-xs text-indigo-600/80 italic">
                {message.reasoning}
              </div>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "inline-block rounded-2xl px-4 py-3 max-w-full",
            isUser
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-md shadow-lg shadow-indigo-500/20"
              : "bg-white border border-stone-200 text-stone-700 rounded-tl-md shadow-sm"
          )}
        >
          {message.content ? (
            <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{message.content}</p>
          ) : message.isStreaming ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          ) : null}
        </div>

        {/* Timestamp */}
        <div className="mt-1.5 text-[11px] text-stone-300">
          {formatDate(message.timestamp)}
        </div>

        {/* Citations */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-stone-400 mb-3 uppercase tracking-wider">Visual Evidence</p>
            <CitationGrid
              citations={message.citations}
              documentNames={documentNames}
            />
          </div>
        )}
      </div>
    </div>
  );
}
