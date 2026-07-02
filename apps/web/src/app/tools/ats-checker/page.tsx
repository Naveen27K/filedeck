'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileSearch,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Award,
  BookOpen,
  Mail,
  TrendingUp,
  ListFilter
} from 'lucide-react';

const COMMON_ACTION_VERBS = [
  'built', 'developed', 'engineered', 'designed', 'implemented', 'led', 'managed',
  'optimized', 'increased', 'decreased', 'reduced', 'architected', 'created', 'scaled',
  'spearheaded', 'delivered', 'improved', 'integrated', 'launched', 'automated'
];

const DEFAULT_JOB_DESC = `We are looking for a Senior Software Engineer with strong expertise in TypeScript, React, Next.js, and Node.js.
Key Responsibilities:
- Build and maintain high-performance web applications using React, Next.js, and Tailwind CSS.
- Design scalable RESTful APIs with Node.js and Express.
- Collaborate with cross-functional teams in an Agile development environment.
- Optimize web application performance and accessibility.
- Experience with Docker, PostgreSQL, CI/CD pipelines, and Git version control is highly desirable.`;

const DEFAULT_RESUME_TEXT = `Jane Doe
Email: jane.doe@example.com | Phone: +1 (555) 019-2834 | Location: San Francisco, CA | Website: https://janedoe.dev

Professional Summary:
Detail-oriented software engineer with 4+ years of experience designing and implementing scalable web applications. Strong expert in TypeScript, React, and server architectures.

Work Experience:
Senior Frontend Developer — Tech Solutions Inc. (2022 - Present)
- Led a team of 4 engineers to build next-generation SaaS dashboards.
- Redesigned internal charting tools, resulting in a 40% performance gain.
- Built responsive user interfaces using React, Next.js, and Tailwind CSS.

Web Developer — AppForge Studio (2020 - 2022)
- Maintained and deployed 15+ client web applications using Node.js and Express.
- Integrated REST APIs and optimized database queries with PostgreSQL.
- Utilized Git for version control and Docker for containerized local development.

Skills:
TypeScript, React, Next.js, Node.js, Express, PostgreSQL, Tailwind CSS, Git, Docker, REST API, Web Performance.`;

export default function ATSCheckerPage() {
  const [resumeText, setResumeText] = useState(DEFAULT_RESUME_TEXT);
  const [jobDescription, setJobDescription] = useState(DEFAULT_JOB_DESC);
  const [analyzed, setAnalyzed] = useState(true);

  // Parse ATS Analysis
  const analysis = useMemo(() => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      return null;
    }

    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobDescription.toLowerCase();

    // 1. Extract potential keywords from Job Description
    const words = jobLower
      .replace(/[^a-z0-9+#.\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'you', 'are', 'our', 'this', 'will', 'that',
      'from', 'have', 'team', 'work', 'key', 'looking', 'using', 'strong', 'ability',
      'experience', 'responsibilities', 'qualifications', 'requirements'
    ]);

    const rawKeywords = Array.from(new Set(words.filter((w) => !stopWords.has(w))));

    // Also look for specific tech terms / multi-word matches
    const keyTechPhrases = [
      'typescript', 'react', 'next.js', 'node.js', 'express', 'postgresql',
      'tailwind css', 'docker', 'git', 'ci/cd', 'agile', 'restful api', 'rest api',
      'web application', 'performance', 'accessibility', 'software engineer'
    ];

    const targetKeywords = Array.from(
      new Set([
        ...keyTechPhrases.filter((phrase) => jobLower.includes(phrase)),
        ...rawKeywords.slice(0, 15)
      ])
    );

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    targetKeywords.forEach((kw) => {
      if (resumeLower.includes(kw)) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    const keywordScore = targetKeywords.length > 0
      ? Math.round((matchedKeywords.length / targetKeywords.length) * 100)
      : 80;

    // 2. Check Contact Details
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
    const hasPhone = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/.test(resumeText);
    const hasLink = /(github|linkedin|http|https|\.dev|\.com)/.test(resumeLower);
    const contactScore = (hasEmail ? 40 : 0) + (hasPhone ? 40 : 0) + (hasLink ? 20 : 0);

    // 3. Action Verbs Check
    const foundVerbs = COMMON_ACTION_VERBS.filter((verb) => resumeLower.includes(verb));
    const verbScore = Math.min(100, Math.round((foundVerbs.length / 5) * 100));

    // 4. Measurable Metrics Check (numbers, percentages, currency)
    const hasMetrics = /(\d+%\b|\$\d+|\b\d+\+\b|\b\d+\s+(users|clients|engineers|projects|team|apps)\b)/i.test(resumeText);
    const metricsScore = hasMetrics ? 100 : 40;

    // Overall Weighted Score
    const overallScore = Math.round(
      keywordScore * 0.45 + contactScore * 0.2 + verbScore * 0.2 + metricsScore * 0.15
    );

    return {
      overallScore,
      keywordScore,
      contactScore,
      verbScore,
      metricsScore,
      matchedKeywords,
      missingKeywords,
      hasEmail,
      hasPhone,
      hasLink,
      foundVerbs,
      hasMetrics
    };
  }, [resumeText, jobDescription]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setResumeText(text);
          setAnalyzed(true);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-900 mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <FileSearch className="h-8 w-8 text-violet-500" />
            ATS Resume Compatibility Checker
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Compare your resume against any job description to check ATS match score, missing keywords, and formatting tips.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tools/resume"
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            Open Resume Builder
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-6 space-y-6">
          {/* Resume Text Input */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-violet-400" />
                Your Resume Text
              </label>
              <label className="text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer">
                Upload .TXT / File
                <input type="file" accept=".txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setAnalyzed(true);
              }}
              rows={10}
              placeholder="Paste your full resume text here..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500 focus:outline-none resize-none font-mono"
            />
          </div>

          {/* Job Description Input */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 space-y-3">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-violet-400" />
              Target Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setAnalyzed(true);
              }}
              rows={8}
              placeholder="Paste the target job description or requirements here..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500 focus:outline-none resize-none font-mono"
            />
          </div>
        </div>

        {/* Right Column: ATS Score & Diagnostics */}
        <div className="lg:col-span-6 space-y-6">
          {analysis ? (
            <>
              {/* Score Header Card */}
              <div className="rounded-2xl border border-slate-850 bg-slate-900/60 p-6 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ATS Match Score</span>
                    <h2 className="text-4xl font-extrabold text-white mt-1">
                      {analysis.overallScore}%
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {analysis.overallScore >= 80
                        ? '🚀 Excellent match! Highly likely to pass ATS screeners.'
                        : analysis.overallScore >= 60
                        ? '⚠️ Good start, but missing key skills and keywords.'
                        : '🔴 Needs improvement. Add missing keywords to boost ranking.'}
                    </p>
                  </div>

                  {/* Circular Score Visual */}
                  <div className="relative flex items-center justify-center">
                    <div className={`h-24 w-24 rounded-full border-8 flex items-center justify-center text-xl font-black ${
                      analysis.overallScore >= 80
                        ? 'border-emerald-500 text-emerald-400'
                        : analysis.overallScore >= 60
                        ? 'border-amber-500 text-amber-400'
                        : 'border-rose-500 text-rose-400'
                    }`}>
                      {analysis.overallScore}%
                    </div>
                  </div>
                </div>

                {/* Metric Bars */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/80">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Keywords Match</span>
                      <span className="text-white font-bold">{analysis.keywordScore}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${analysis.keywordScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Contact Details</span>
                      <span className="text-white font-bold">{analysis.contactScore}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analysis.contactScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Action Verbs</span>
                      <span className="text-white font-bold">{analysis.verbScore}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${analysis.verbScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Measurable Impact</span>
                      <span className="text-white font-bold">{analysis.metricsScore}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${analysis.metricsScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Keywords Match Section */}
              <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="h-4 w-4 text-violet-400" />
                  Matched & Missing Keywords
                </h3>

                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Matched ({analysis.matchedKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.matchedKeywords.map((kw, i) => (
                      <span key={i} className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                        {kw}
                      </span>
                    ))}
                    {analysis.matchedKeywords.length === 0 && (
                      <span className="text-xs text-slate-500">No matching keywords found.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Missing Keywords ({analysis.missingKeywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingKeywords.map((kw, i) => (
                      <span key={i} className="rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400 border border-rose-500/20">
                        + {kw}
                      </span>
                    ))}
                    {analysis.missingKeywords.length === 0 && (
                      <span className="text-xs text-emerald-400">All key terms present!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Formatting & Content Checklist */}
              <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  ATS Optimization Checklist
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-950">
                    <span className="text-slate-300">Valid Email Address</span>
                    {analysis.hasEmail ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Found</span>
                    ) : (
                      <span className="text-rose-400 font-semibold flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Missing</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-950">
                    <span className="text-slate-300">Phone Number</span>
                    {analysis.hasPhone ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Found</span>
                    ) : (
                      <span className="text-rose-400 font-semibold flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Missing</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-950">
                    <span className="text-slate-300">Portfolio / GitHub / Website Link</span>
                    {analysis.hasLink ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Found</span>
                    ) : (
                      <span className="text-amber-400 font-semibold flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Recommended</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-950">
                    <span className="text-slate-300">Strong Action Verbs</span>
                    <span className="text-slate-400">{analysis.foundVerbs.length} detected</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-300">Quantifiable Metrics (% or numbers)</span>
                    {analysis.hasMetrics ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Present</span>
                    ) : (
                      <span className="text-amber-400 font-semibold flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Add numbers</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-12 text-center text-slate-500">
              Paste your resume and job description to view ATS analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
