import React from 'react';
import { cn } from '../lib/utils';
import { SummaryStyle, SummaryLength } from '../services/gemini';
import { Settings2, BarChart3, ListFilter } from 'lucide-react';

interface SummaryConfigProps {
  style: SummaryStyle;
  setStyle: (s: SummaryStyle) => void;
  length: SummaryLength;
  setLength: (l: SummaryLength) => void;
}

export function SummaryConfig({ style, setStyle, length, setLength }: SummaryConfigProps) {
  const styles: { id: SummaryStyle; label: string }[] = [
    { id: 'bullet points', label: 'Key Points' },
    { id: 'prose', label: 'Narrative' },
    { id: 'executive summary', label: 'Executive' },
    { id: 'action items', label: 'Actionable' },
  ];

  const lengths: { id: SummaryLength; label: string }[] = [
    { id: 'short', label: 'Concise' },
    { id: 'medium', label: 'Balanced' },
    { id: 'detailed', label: 'Deep Dive' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 bg-white rounded-xl border border-border card-shadow">
      <div className="flex-1 space-y-4">
        <label className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">
          <ListFilter className="w-3.5 h-3.5" />
          Output Format
        </label>
        <div className="flex flex-wrap gap-2">
          {styles.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all border",
                style === s.id 
                  ? "bg-blue-50 border-accent text-accent" 
                  : "bg-white border-border text-text-secondary hover:border-slate-300 hover:text-text-primary"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-px bg-border hidden md:block" />

      <div className="flex-1 space-y-4">
        <label className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">
          <BarChart3 className="w-3.5 h-3.5" />
          Detail Density
        </label>
        <div className="flex flex-wrap gap-2">
          {lengths.map((l) => (
            <button
              key={l.id}
              onClick={() => setLength(l.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all border",
                length === l.id 
                  ? "bg-blue-50 border-accent text-accent" 
                  : "bg-white border-border text-text-secondary hover:border-slate-300 hover:text-text-primary"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
