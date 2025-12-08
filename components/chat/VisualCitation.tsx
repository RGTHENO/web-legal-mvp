"use client";

import { useState } from "react";
import { X, ZoomIn, FileText } from "lucide-react";
import type { Citation } from "@/lib/types";

interface VisualCitationProps {
  citation: Citation;
  documentName?: string;
}

export function VisualCitation({ citation, documentName }: VisualCitationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Thumbnail Card */}
      <div
        onClick={() => setIsExpanded(true)}
        className="group border border-stone-200 rounded-xl overflow-hidden bg-white hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer animate-slide-up"
      >
        <div className="relative aspect-[3/4] bg-stone-50">
          <img
            src={`data:image/png;base64,${citation.image_base64}`}
            alt={`Page ${citation.page}`}
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/20 transition-colors flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
        </div>
        <div className="p-3 border-t border-stone-100">
          <div className="flex items-center gap-2 text-[11px] text-stone-400 mb-1.5">
            <FileText className="w-3 h-3" />
            <span className="truncate">{documentName || citation.document_id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-stone-700">
              Page {citation.page}
            </span>
            <span className="text-xs text-indigo-600 font-medium">
              {(citation.score * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <div>
                <h3 className="font-medium text-stone-800">
                  Page {citation.page}
                </h3>
                <p className="text-sm text-stone-500">
                  Relevance: {(citation.score * 100).toFixed(1)}%
                </p>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-80px)] p-4 bg-stone-50">
              <img
                src={`data:image/png;base64,${citation.image_base64}`}
                alt={`Page ${citation.page}`}
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Grid of citations */
interface CitationGridProps {
  citations: Citation[];
  documentNames?: Record<string, string>;
}

export function CitationGrid({ citations, documentNames = {} }: CitationGridProps) {
  if (citations.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {citations.map((citation, index) => (
        <VisualCitation
          key={`${citation.document_id}-${citation.page}-${index}`}
          citation={citation}
          documentName={documentNames[citation.document_id]}
        />
      ))}
    </div>
  );
}
