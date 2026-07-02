'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingStateProps {
  progress?: number;
  message?: string;
}

export default function ProcessingState({
  progress,
  message = 'Processing file(s)... Please do not close this tab.',
}: ProcessingStateProps) {
  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col items-center justify-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
          <div className="absolute inset-0 rounded-full border border-violet-500/10 animate-ping"></div>
        </div>

        <h3 className="mt-6 text-base font-semibold text-white">Working...</h3>
        <p className="mt-1.5 text-sm text-slate-500">{message}</p>

        {progress !== undefined && (
          <div className="mt-6 w-full max-w-md">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-850">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
