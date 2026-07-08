'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, FolderOpen, ArrowRight, Sparkles, FileText, LayoutTemplate, HelpCircle, FileSearch, Mail } from 'lucide-react';
import { TOOLS, TOOL_CATEGORIES } from '@/lib/tools-config';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="relative min-h-screen bg-slate-950 pb-20 text-slate-100 overflow-hidden">
      {/* Background Decorative Glow Spheres */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          One Deck. All Your{' '}
          <span className="bg-gradient-to-r from-violet-400 via-violet-500 to-indigo-400 bg-clip-text text-transparent">
            File Utilities
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
          Process PDFs, images, documents, audio, and videos completely in your browser. Private, secure, and instant, with files never leaving your device.
        </p>

        {/* Live Search Bar */}
        <div className="mx-auto mt-10 max-w-xl">
          <div className="relative flex items-center rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5 shadow-2xl backdrop-blur-md focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/15 transition-all">
            <Search className="ml-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for a tool (e.g. merge PDF, crop image)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-0 bg-transparent px-3 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-2 pb-4 border-b border-slate-900">
          <button
            onClick={() => setActiveCategory('all')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeCategory === 'all'
                ? 'bg-violet-600 text-white shadow shadow-violet-600/30'
                : 'bg-slate-900/60 text-slate-400 border border-slate-850 hover:text-white hover:bg-slate-850'
            }`}
          >
            All Tools
          </button>
          {Object.entries(TOOL_CATEGORIES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                activeCategory === key
                  ? 'bg-violet-600 text-white shadow shadow-violet-600/30'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-850 hover:text-white hover:bg-slate-850'
              }`}
            >
              {value.name}
            </button>
          ))}
          {/* Career Suite shortcuts */}
          <Link
            href="/tools/resume"
            className="rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-slate-900/60 text-slate-400 border border-slate-850 hover:text-white hover:bg-slate-850 transition-all flex items-center gap-1.5"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            Resume Builder
          </Link>
          <Link
            href="/tools/ats-checker"
            className="rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-slate-900/60 text-slate-400 border border-slate-850 hover:text-white hover:bg-slate-850 transition-all flex items-center gap-1.5"
          >
            <FileSearch className="h-3.5 w-3.5" />
            ATS Checker
          </Link>
          <Link
            href="/tools/cover-letter"
            className="rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-slate-900/60 text-slate-400 border border-slate-850 hover:text-white hover:bg-slate-850 transition-all flex items-center gap-1.5"
          >
            <Mail className="h-3.5 w-3.5" />
            Cover Letter
          </Link>
        </div>
      </div>

      {/* Filtered Tools Grid */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => {
              const catInfo = TOOL_CATEGORIES[tool.category];
              return (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.category}/${tool.id}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-900 bg-slate-900/40 p-6 hover:border-slate-850 hover:bg-slate-900/60 transition-all duration-200 relative overflow-hidden shadow-sm"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ArrowRight className="h-4 w-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div>
                    <div className={`inline-flex rounded-xl p-3 bg-gradient-to-r ${catInfo.color} mb-4`}>
                      <tool.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{tool.name}</h3>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">{tool.description}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-950 flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                    <span>{catInfo.name}</span>
                    {tool.maxSizeMB > 0 && <span>Max {tool.maxSizeMB}MB</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No tools found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* About Section */}
      <div id="about" className="mx-auto max-w-4xl px-4 mt-32 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-8 md:p-12 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-8 text-violet-500/10 pointer-events-none">
            <HelpCircle className="h-32 w-32" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">About FileDeck</h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
            FileDeck is a collection of open-source document manipulation utility tools built to operate natively inside the user's browser. Privacy is our top concern: all actions involving PDF formatting and image resizing happen locally without transferring private contents to an external server. The platform requires no payment info or sign-up gates.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
            <span>• No paywalls or upgrade limits</span>
            <span>• No cookies or ad trackers</span>
            <span>• Direct file streams</span>
          </div>
        </div>
      </div>
    </div>
  );
}
