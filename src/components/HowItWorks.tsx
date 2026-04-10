"use client";
import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

interface Step { title: string; desc: string; }

export default function HowItWorks({ steps }: { steps: Step[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
          open
            ? "bg-indigo-50 text-indigo-600 border-indigo-200"
            : "bg-white text-gray-400 border-gray-200 hover:text-gray-600 hover:border-gray-300"
        }`}
      >
        <HelpCircle size={13} />
        Comment ça fonctionne
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-30 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-900">Comment ça fonctionne</span>
            <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
              <X size={15} />
            </button>
          </div>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{step.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
