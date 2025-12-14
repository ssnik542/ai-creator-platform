"use client";
import { diffWords } from "diff";
import { Button } from "@/components/ui/button";
export default function AIDiffModal({
  original,
  improved,
  onAccept,
  onCancel,
}) {
  const diff = diffWords(original, improved);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-slate-900 border border-white/10 rounded-xl max-w-4xl w-full p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">
          AI Suggested Changes
        </h2>

        <div className="max-h-[60vh] overflow-y-auto bg-slate-950 p-4 rounded-lg text-sm leading-relaxed">
          {diff.map((part, i) => {
            let cls = "";
            if (part.added) cls = "bg-green-500/20 text-green-300";
            if (part.removed) cls = "bg-red-500/20 text-red-300";
            return (
              <span key={i} className={cls}>
                {part.value}
              </span>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onAccept}>Accept changes</Button>
        </div>
      </div>
    </div>
  );
}
