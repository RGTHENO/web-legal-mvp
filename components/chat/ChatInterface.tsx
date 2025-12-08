"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { 
  FileText, 
  ChevronDown, 
  Sparkles, 
  Zap, 
  BookOpen,
  Trash2,
  Clock,
  Target,
  HelpCircle
} from "lucide-react";
import type { DocumentInfo, Message } from "@/lib/types";
import { generateId, cn } from "@/lib/utils";
import { getQueryStreamUrl, deleteDocument } from "@/lib/api";
import { useAgentStream } from "@/lib/useAgentStream";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

interface ChatInterfaceProps {
  documents: DocumentInfo[];
  activeDocumentId: string | null;
  onDocumentSelect: (id: string | null) => void;
  onDocumentUploaded: (doc: DocumentInfo) => void;
  onDocumentDeleted: (docId: string) => void;
}

const QUICK_PROMPTS = [
  { icon: Target, label: "Key clauses", prompt: "What are the key clauses in this document?" },
  { icon: Zap, label: "Risks", prompt: "Identify potential legal risks or concerning provisions" },
  { icon: BookOpen, label: "Summary", prompt: "Provide a comprehensive summary of this document" },
  { icon: HelpCircle, label: "Obligations", prompt: "What are the main obligations and responsibilities?" },
];

export function ChatInterface({
  documents,
  activeDocumentId,
  onDocumentSelect,
  onDocumentUploaded,
  onDocumentDeleted,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showDocList, setShowDocList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentMessageIdRef = useRef<string | null>(null);

  // Build document name lookup
  const documentNames = useMemo(() => {
    return documents.reduce(
      (acc, doc) => ({ ...acc, [doc.id]: doc.filename }),
      {} as Record<string, string>
    );
  }, [documents]);

  const activeDocument = useMemo(() => {
    return documents.find(d => d.id === activeDocumentId);
  }, [documents, activeDocumentId]);

  // Scroll to bottom when messages update
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Update the current assistant message
  const updateCurrentMessage = useCallback(
    (updates: Partial<Message>) => {
      if (!currentMessageIdRef.current) return;
      const messageId = currentMessageIdRef.current;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        )
      );
    },
    []
  );

  const { isLoading, startStream } = useAgentStream({
    onStatus: (status) => updateCurrentMessage({ status }),
    onReasoning: (reasoning) => updateCurrentMessage({ reasoning }),
    onCitation: (citation) =>
      updateCurrentMessage({
        citations: [
          ...(messages.find((m) => m.id === currentMessageIdRef.current)
            ?.citations || []),
          citation,
        ],
      }),
    onToken: (token) =>
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === currentMessageIdRef.current
            ? { ...msg, content: msg.content + token }
            : msg
        )
      ),
    onComplete: () =>
      updateCurrentMessage({ isStreaming: false, status: undefined }),
    onError: (error) =>
      updateCurrentMessage({
        content: `Error: ${error}`,
        isStreaming: false,
        status: undefined,
      }),
  });

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Add user message
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        citations: [],
        isStreaming: true,
        timestamp: new Date(),
      };

      currentMessageIdRef.current = assistantMessage.id;

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      // Start the stream
      const body = JSON.stringify({
        query: content,
        document_id: activeDocumentId,
      });

      await startStream(getQueryStreamUrl(), body);
    },
    [activeDocumentId, startStream]
  );

  const handleDeleteDocument = useCallback(async (docId: string) => {
    try {
      await deleteDocument(docId);
      onDocumentDeleted(docId);
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  }, [onDocumentDeleted]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    if (!isLoading && documents.length > 0) {
      handleSendMessage(prompt);
    }
  }, [isLoading, documents.length, handleSendMessage]);

  return (
    <div className="h-full flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-lg">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-white/5">
                  <Sparkles className="w-10 h-10 text-violet-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-3">
                  Visual Document Intelligence
                </h2>
                <p className="text-white/50 mb-8 leading-relaxed">
                  {documents.length === 0 
                    ? "Attach a PDF document using the button below, then ask questions about its contents. I'll show you the exact pages and sections."
                    : "Ask questions about your indexed documents. I'll find relevant sections and show you the visual evidence."
                  }
                </p>

                {/* Quick Prompts */}
                {documents.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {QUICK_PROMPTS.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleQuickPrompt(item.prompt)}
                        disabled={isLoading}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200",
                          "bg-white/[0.03] border border-white/5",
                          "hover:bg-white/[0.06] hover:border-white/10",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <item.icon className="w-5 h-5 text-violet-400 flex-shrink-0" />
                        <span className="text-sm text-white/70">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  documentNames={documentNames}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl p-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <ChatInput 
              onSubmit={handleSendMessage} 
              onDocumentUploaded={onDocumentUploaded}
              isLoading={isLoading} 
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-72 border-l border-white/5 bg-[#0a0a0f]/50 flex flex-col flex-shrink-0">
        {/* Document Scope */}
        <div className="p-4 border-b border-white/5">
          <label className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-2">
            Query Scope
          </label>
          <div className="relative">
            <button
              onClick={() => setShowDocList(!showDocList)}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left transition-all",
                "bg-white/[0.03] border border-white/10 hover:border-white/20",
                showDocList && "border-violet-500/50"
              )}
            >
              <span className="text-sm text-white/70 truncate">
                {activeDocumentId 
                  ? documents.find(d => d.id === activeDocumentId)?.filename || "Unknown"
                  : "All Documents"
                }
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 text-white/40 transition-transform",
                showDocList && "rotate-180"
              )} />
            </button>

            {showDocList && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-[#15151f] border border-white/10 shadow-xl z-10">
                <button
                  onClick={() => { onDocumentSelect(null); setShowDocList(false); }}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-left text-sm transition-colors",
                    !activeDocumentId ? "bg-violet-500/20 text-violet-300" : "text-white/60 hover:bg-white/5"
                  )}
                >
                  All Documents
                </button>
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => { onDocumentSelect(doc.id); setShowDocList(false); }}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg text-left text-sm transition-colors truncate",
                      activeDocumentId === doc.id ? "bg-violet-500/20 text-violet-300" : "text-white/60 hover:bg-white/5"
                    )}
                  >
                    {doc.filename}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Document Info */}
        {activeDocument && (
          <div className="p-4 border-b border-white/5">
            <label className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-3">
              Active Document
            </label>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-violet-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white/80 truncate">
                    {activeDocument.filename}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {activeDocument.page_count} pages
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-4">
          <label className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-3">
            Indexed Documents ({documents.length})
          </label>
          
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-xs text-white/30">
                No documents yet
              </p>
              <p className="text-xs text-white/20 mt-1">
                Use the attachment button below
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "group p-3 rounded-xl transition-all duration-200",
                    "bg-white/[0.02] border border-white/5",
                    "hover:bg-white/[0.04] hover:border-white/10"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/70 truncate">
                        {doc.filename}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-white/30">
                          {doc.page_count} pages
                        </span>
                        <span className="text-white/10">•</span>
                        <Clock className="w-3 h-3 text-white/30" />
                        <span className="text-[10px] text-white/30">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="p-4 border-t border-white/5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-violet-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-violet-300">Pro Tip</p>
                <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                  Ask specific questions for better results. Try &quot;What are the termination clauses?&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
