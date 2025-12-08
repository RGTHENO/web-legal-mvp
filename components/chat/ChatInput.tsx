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
              ? "bg-red-50 border-red-200" 
              : uploadComplete 
                ? "bg-emerald-50 border-emerald-200"
                : "bg-stone-50 border-stone-200"
          )}>
            {/* File Icon */}
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              uploadError 
                ? "bg-red-100" 
                : uploadComplete 
                  ? "bg-emerald-100"
                  : "bg-indigo-100"
            )}>
              {uploadComplete ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : uploadError ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <FileText className="w-5 h-5 text-indigo-600" />
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">
                {pendingFile.name}
              </p>
              <p className="text-xs text-stone-500">
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
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                >
                  Index
                </button>
                <button
                  onClick={handleRemoveFile}
                  className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {isUploading && (
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            )}

            {uploadComplete && (
              <button
                onClick={handleRemoveFile}
                className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
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
          "bg-white border-stone-200",
          "focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100",
          "shadow-sm hover:shadow-md"
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
              "text-stone-400 hover:text-indigo-600 hover:bg-indigo-50",
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
              "text-stone-800 placeholder:text-stone-400",
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
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                : "bg-stone-100 text-stone-300 cursor-not-allowed"
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
        <p className="absolute -bottom-6 left-0 text-[11px] text-stone-400">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
