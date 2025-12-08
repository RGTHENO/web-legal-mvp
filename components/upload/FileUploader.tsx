"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { getUploadStreamUrl } from "@/lib/api";
import { useAgentStream } from "@/lib/useAgentStream";
import type { DocumentInfo } from "@/lib/types";

interface FileUploaderProps {
  onDocumentUploaded: (doc: DocumentInfo) => void;
}

export function FileUploader({ onDocumentUploaded }: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLoading, status, error, isComplete, startStream, reset } =
    useAgentStream({
      onComplete: (data) => {
        if (data) {
          onDocumentUploaded(data);
        }
      },
    });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      reset();
    }
  }, [reset]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        reset();
      }
    },
    [reset]
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    await startStream(getUploadStreamUrl(), formData);
  }, [selectedFile, startStream]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [reset]);

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
          isDragOver
            ? "border-accent-500 bg-accent-50"
            : "border-slate-300 hover:border-slate-400 bg-white",
          isLoading && "pointer-events-none opacity-70"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!selectedFile ? (
          <>
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-medium text-slate-700 mb-1">
              Drop your PDF here
            </p>
            <p className="text-sm text-slate-500">
              or click to browse • PDF files only
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 truncate max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-sm text-slate-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status / Progress */}
      {(isLoading || error || isComplete) && (
        <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            {isLoading && (
              <>
                <Loader2 className="w-5 h-5 text-accent-600 animate-spin" />
                <span className="text-sm text-slate-600">{status || "Processing..."}</span>
              </>
            )}
            {error && (
              <>
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-600">{error}</span>
              </>
            )}
            {isComplete && !error && (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600">
                  Document indexed successfully!
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {selectedFile && !isLoading && !isComplete && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleUpload}
            className="flex-1 px-4 py-2.5 bg-accent-600 text-white font-medium rounded-lg hover:bg-accent-700 transition-colors"
          >
            Upload & Index
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <button
          onClick={handleReset}
          className="mt-3 text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

