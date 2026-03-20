'use client';

import { FileSearch, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNav({ activeTab, setActiveTab }) {
  return (
    <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-16 z-40">
      <button
        onClick={() => setActiveTab('scanner')}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all border-b-2",
          activeTab === 'scanner'
            ? "text-indigo-600 border-indigo-600 bg-indigo-50/50"
            : "text-slate-500 border-transparent hover:text-slate-700"
        )}
      >
        <FileSearch size={16} /> Scanner
      </button>
      <button
        onClick={() => setActiveTab('humanizer')}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all border-b-2",
          activeTab === 'humanizer'
            ? "text-emerald-500 border-emerald-500 bg-emerald-50/50"
            : "text-slate-500 border-transparent hover:text-slate-700"
        )}
      >
        <Zap size={16} /> Humanizer
      </button>
    </div>
  );
}
