import React from 'react';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/40 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-violet-600 text-white">
                <FolderOpen className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                File<span className="text-violet-500">Deck</span>
              </span>
            </div>
            <p className="text-sm text-slate-500">
              The ultimate free web toolkit for processing documents, PDFs, images, media, and resume formatting. No ads, no limits, no sign-ups.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#pdf" className="hover:text-white transition-colors">PDF Toolkit</Link></li>
              <li><Link href="/#image" className="hover:text-white transition-colors">Image Utilities</Link></li>
              <li><Link href="/#document" className="hover:text-white transition-colors">Document Editor</Link></li>
              <li><Link href="/tools/resume" className="hover:text-white transition-colors">Resume Builder</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Utilities & Media</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#audio" className="hover:text-white transition-colors">Audio Tools</Link></li>
              <li><Link href="/#video" className="hover:text-white transition-colors">Video Tools</Link></li>
              <li><Link href="/#utilities" className="hover:text-white transition-colors">General Utilities</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Privacy & Access</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>• Files auto-deleted after 1 hour</li>
              <li>• Local processing in your browser</li>
              <li>• 100% Free / Open Access</li>
              <li>• No AI tracking or user accounts</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} FileDeck. Released under MIT license.</p>
          <div className="flex gap-4">
            <Link href="/#about" className="hover:text-slate-400">About</Link>
            <Link href="/#privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/#terms" className="hover:text-slate-400">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
