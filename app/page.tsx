"use client";

import { useState, useEffect } from "react";
import { Scale } from "lucide-react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { DocumentInfo } from "@/lib/types";
import { getDocuments } from "@/lib/api";

export default function Home() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  // Load existing documents on mount
  useEffect(() => {
    getDocuments()
      .then(setDocuments)
      .catch(console.error);
  }, []);

  const handleDocumentUploaded = (doc: DocumentInfo) => {
    setDocuments((prev) => [...prev, doc]);
    setActiveDocumentId(doc.id);
  };

  const handleDocumentDeleted = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (activeDocumentId === docId) {
      setActiveDocumentId(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f]">
      {/* Minimal Header */}
      <header className="flex-shrink-0 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="px-6 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">LexVisual</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Visual RAG</p>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <main className="flex-1 overflow-hidden">
        <ChatInterface
          documents={documents}
          activeDocumentId={activeDocumentId}
          onDocumentSelect={setActiveDocumentId}
          onDocumentUploaded={handleDocumentUploaded}
          onDocumentDeleted={handleDocumentDeleted}
        />
      </main>
    </div>
  );
}
