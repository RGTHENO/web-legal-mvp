"use client";

import { useState, useCallback, useRef, type KeyboardEvent } from "react";
import { Send, Loader2, Paperclip, X, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { getUploadStreamUrl } from "@/lib/api";
import { useAgentStream } from "@/lib/useAgentStream";
import type { DocumentInfo } from "@/lib/types";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  onDocumentUploaded: (doc: DocumentInfo) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSubmit,
  onDocumentUploaded,
  isLoading = false,
  placeholder = "Ask about your legal documents...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isLoading: isUploading,
    status: uploadStatus,
    error: uploadError,
    isComplete: uploadComplete,
    startStream,
    reset: resetUpload,
  } = useAgentStream({
    onComplete: (data) => {
      if (data) {
        onDocumentUploaded(data);
        setPendingFile(null);
        // Auto-clear success after 2 seconds
        setTimeout(() => {
          resetUpload();
        }, 2000);
      }
    },
  });

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    onSubmit(trimmed);
    setInput("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isLoading, onSubmit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === "application/pdf") {
        setPendingFile(file);
        resetUpload();
      }
    },
    [resetUpload]
  );

  const handleUpload = useCallback(async () => {
    if (!pendingFile) return;

    const formData = new FormData();
    formData.append("file", pendingFile);
    await startStream(getUploadStreamUrl(), formData);
  }, [pendingFile, startStream]);

  const handleRemoveFile = useCallback(() => {
    setPendingFile(null);
    resetUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [resetUpload]);

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="w-full space-y-3">
      {/* Pending File Preview */}
      {pendingFile && (
        <div className="animate-fade-in">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl border",
            uploadError 
              ? "bg-red-500/10 border-red-500/20" 
              : uploadComplete 
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-white/5 border-white/10"
          )}>
            {/* File Icon */}
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              uploadError 
                ? "bg-red-500/20" 
                : uploadComplete 
                  ? "bg-emerald-500/20"
                  : "bg-violet-500/20"
            )}>
              {uploadComplete ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : uploadError ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : (
                <FileText className="w-5 h-5 text-violet-400" />
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {pendingFile.name}
              </p>
              <p className="text-xs text-white/50">
                {isUploading ? uploadStatus || "Processing..." : 
                 uploadComplete ? "Indexed successfully!" :
                 uploadError ? uploadError :
                 formatFileSize(pendingFile.size)}
              </p>
            </div>

            {/* Actions */}
            {!isUploading && !uploadComplete && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUpload}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
                >
                  Index
                </button>
                <button
                  onClick={handleRemoveFile}
                  className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {isUploading && (
              <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
            )}

            {uploadComplete && (
              <button
                onClick={handleRemoveFile}
                className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="relative group">
        <div className={cn(
          "flex items-end gap-2 p-2 rounded-2xl border transition-all duration-200",
          "bg-white/[0.03] border-white/10",
          "focus-within:border-violet-500/50 focus-within:bg-white/[0.05]",
          "shadow-lg shadow-black/20"
        )}>
          {/* Attach Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={handleAttachClick}
            disabled={isLoading || isUploading}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200",
              "text-white/40 hover:text-white/70 hover:bg-white/5",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Attach PDF document"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent px-2 py-2.5",
              "text-white placeholder:text-white/30",
              "focus:outline-none",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "min-h-[44px] max-h-[200px]",
              "text-[15px] leading-relaxed"
            )}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 200) + "px";
            }}
          />

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200",
              input.trim() && !isLoading
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                : "bg-white/5 text-white/20 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Hint */}
        <p className="absolute -bottom-6 left-0 text-[11px] text-white/20">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
