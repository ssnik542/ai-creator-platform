"use client";

import { useState } from "react";
import { transformForReaderMode } from "@/app/actions/readerMode";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
export function ReaderModeToggle({
  content,
  onUpdate,
  setReaderModeModal,
  setMode,
  mode,
  setLoading,
}) {
  async function handleModeChange(selectedMode) {
    setReaderModeModal(true);
    if (selectedMode === "original") {
      onUpdate(content);
      return;
    }
    setLoading(true);
    setMode(selectedMode);
    try {
      const transformed = await transformForReaderMode({
        content,
        mode: selectedMode,
      });
      onUpdate(transformed);
    } catch {
      toast.error("Failed to switch reader mode");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="text-slate-400">Read this as:</span>

      {[
        { id: "quick", label: "Quick overview" },
        { id: "beginner", label: "Beginner-friendly" },
        { id: "deep", label: "Deep dive" },
      ].map((m) => (
        <button
          key={m.id}
          onClick={() => handleModeChange(m.id)}
          className={`
        px-3 py-1.5 rounded-md transition cursor-pointer
        ${
          mode === m.id
            ? "bg-purple-600 text-white"
            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
        }
      `}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

export function ReaderModeModal({ open, onClose, mode, content, loading }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          max-w-3xl 
          bg-slate-900 
          border border-slate-700 
          text-slate-100 
          rounded-xl
          shadow-2xl
          p-0
        "
      >
        {/* HEADER (fixed inside modal) */}
        <DialogHeader
          className="
            flex flex-row items-center justify-between
            px-6 py-4
            border-b border-slate-700
            sticky top-0
            bg-slate-900
            rounded-xl
            z-10
          "
        >
          <DialogTitle className="text-lg font-semibold">
            {mode.toUpperCase()} MODE
          </DialogTitle>

          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(content);
                toast.success("Copied to clipboard");
              }}
              className="
        text-xs px-2 py-1 rounded-md
        text-slate-400
        hover:text-white
        hover:bg-slate-800
        transition
        cursor-pointer
      "
              disabled={loading}
            >
              Copy
            </button>

            {/* Close button */}
            <DialogClose asChild>
              <button
                className="
          rounded-md p-1 
          text-slate-400 
          hover:text-white 
          hover:bg-slate-800
          transition
           cursor-pointer
        "
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* SCROLLABLE CONTENT */}
        {loading ? (
          <div className="space-y-3 p-4 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-800 rounded w-2/3" />
          </div>
        ) : (
          <div
            className="
            max-h-[65vh]
            overflow-y-auto
            px-6
            prose prose-lg
            max-w-none
            prose-invert
            prose-purple
          "
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
