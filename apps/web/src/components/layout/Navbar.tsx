'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, FolderOpen, Menu, X, FileText, Image as ImageIcon, Video, Music, Sparkles, Settings } from 'lucide-react';



const CATEGORIES = [
  { name: 'PDF Tools', href: '/#pdf', icon: FileText, color: 'text-rose-500' },
  { name: 'Image Tools', href: '/#image', icon: ImageIcon, color: 'text-emerald-500' },
  { name: 'Document Tools', href: '/#document', icon: FileText, color: 'text-blue-500' },
  { name: 'Audio Tools', href: '/#audio', icon: Music, color: 'text-amber-500' },
  { name: 'Video Tools', href: '/#video', icon: Video, color: 'text-indigo-500' },
  { name: 'Resume & Cover Letter', href: '/tools/resume', icon: Sparkles, color: 'text-violet-500' },
  { name: 'Utilities', href: '/#utilities', icon: Settings, color: 'text-slate-400' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white transition-all group-hover:scale-105 group-hover:bg-violet-500 shadow-lg shadow-violet-500/20">
                <FolderOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                File<span className="text-violet-500">Deck</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <div className="relative">
                <button
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors py-2"
                >
                  Tools <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute left-0 mt-0 w-64 origin-top-left rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    {CATEGORIES.map((category) => {
                      const Icon = category.icon;
                      return (
                        <Link
                          key={category.name}
                          href={category.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-150"
                        >
                          <Icon className={`h-4.5 w-4.5 ${category.color}`} />
                          <span>{category.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
              <Link href="/tools/resume" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Resume Builder
              </Link>
              <Link href="/tools/ats-checker" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                ATS Checker
              </Link>
              <Link href="/tools/cover-letter" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Cover Letter
              </Link>
              <Link href="/#about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                About
              </Link>
            </div>
          </div>

          {/* Right Action */}
          <div className="hidden md:flex items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              100% Free & Open Access
            </span>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-850 bg-slate-950 px-4 py-3 space-y-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Categories
          </div>
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={category.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-all"
              >
                <Icon className={`h-5 w-5 ${category.color}`} />
                <span>{category.name}</span>
              </Link>
            );
          })}
          <div className="border-t border-slate-900 my-2 pt-2">
            <Link
              href="/#about"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-all"
            >
              About FileDeck
            </Link>
          </div>
          <div className="px-3 py-2 flex items-center justify-center border-t border-slate-900 mt-2 pt-2">
            <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              Free, No-Account File Tools
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}
