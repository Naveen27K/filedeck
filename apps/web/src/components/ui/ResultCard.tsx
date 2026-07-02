'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, RefreshCw, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultCardProps {
  downloadUrl: string;
  fileName: string;
  fileSizeBytes?: number;
  previewUrl?: string;
  onReset: () => void;
}

export default function ResultCard({
  downloadUrl,
  fileName,
  fileSizeBytes,
  previewUrl,
  onReset,
}: ResultCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Fire confetti for accomplishment
    const duration = 0.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b5cf6', '#6366f1'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b5cf6', '#6366f1'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>

        <h3 className="mt-6 text-xl font-bold text-white tracking-tight">File Processed Successfully!</h3>
        <p className="mt-2 text-sm text-slate-400 break-all max-w-md">{fileName}</p>
        {fileSizeBytes !== undefined && (
          <p className="mt-1 text-xs text-slate-500">{(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
          <a
            href={downloadUrl}
            download={fileName}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/30 hover:scale-[1.02] duration-200"
          >
            <Download className="h-4.5 w-4.5" />
            Download File
          </a>

          {previewUrl && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
            >
              <Eye className="h-4.5 w-4.5" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          )}
        </div>

        {/* Live Preview Pane */}
        {showPreview && previewUrl && (
          <div className="mt-6 w-full rounded-xl border border-slate-850 bg-slate-950 p-2 overflow-hidden max-h-[300px] flex items-center justify-center animate-in fade-in duration-200">
            {fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
              <img
                src={previewUrl}
                alt="Preview of processed asset"
                className="max-w-full max-h-[280px] object-contain rounded-lg"
              />
            ) : (
              <iframe src={previewUrl} className="w-full h-[280px] rounded-lg border-0" title="File Preview" />
            )}
          </div>
        )}

        <button
          onClick={onReset}
          className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-violet-400 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Process Another File
        </button>
      </div>
    </div>
  );
}
