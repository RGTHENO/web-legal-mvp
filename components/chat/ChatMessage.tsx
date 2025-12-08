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
            ? "bg-white/10" 
            : "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white/70" />
        ) : (
          <Bot className="w-4 h-4 text-violet-400" />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", isUser ? "text-right" : "text-left")}>
        {/* Status/Reasoning indicators for assistant */}
        {!isUser && (message.status || message.reasoning) && (
          <div className="mb-3 space-y-1.5">
            {message.status && (
              <div className="flex items-center gap-2 text-xs text-white/40">
                {message.isStreaming && (
                  <Loader2 className="w-3 h-3 animate-spin text-violet-400" />
                )}
                <span>{message.status}</span>
              </div>
            )}
            {message.reasoning && (
              <div className="text-xs text-violet-400/80 italic">
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
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-tr-md shadow-lg shadow-violet-500/20"
              : "bg-white/[0.03] border border-white/10 text-white/80 rounded-tl-md"
          )}
        >
          {message.content ? (
            <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{message.content}</p>
          ) : message.isStreaming ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          ) : null}
        </div>

        {/* Timestamp */}
        <div className="mt-1.5 text-[11px] text-white/20">
          {formatDate(message.timestamp)}
        </div>

        {/* Citations */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Visual Evidence</p>
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
