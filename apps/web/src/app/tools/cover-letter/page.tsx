'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Copy,
  Check,
  User,
  Building,
  FileText,
  Sparkles,
  LayoutTemplate
} from 'lucide-react';

export default function CoverLetterBuilder() {
  const [copied, setCopied] = useState(false);
  const [template, setTemplate] = useState<'modern' | 'classic' | 'executive'>('modern');

  // Form State
  const [details, setDetails] = useState({
    fullName: 'Jane Doe',
    title: 'Senior Frontend Engineer',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    
    recipientName: 'Hiring Manager',
    companyName: 'Acme Technologies',
    companyAddress: '100 Innovation Way, San Francisco, CA 94105',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),

    openingGreeting: 'Dear Hiring Manager,',
    introParagraph: 'I am writing to express my enthusiastic interest in the Senior Frontend Engineer position at Acme Technologies. With over four years of hands-on experience building scalable web applications, optimizing user performance, and working with modern web technologies such as React and TypeScript, I am confident in my ability to make an immediate impact on your engineering team.',
    bodyParagraph: 'In my recent role at Tech Solutions Inc., I led a frontend team that successfully overhauled our core client analytics platform. This initiative reduced bundle load times by 40% and improved customer retention rates across our top enterprise tier. I pride myself on writing clean, accessible code and collaborating closely with product managers and backend engineers to turn complex requirements into smooth, intuitive user experiences.',
    companyFitParagraph: 'Acme Technologies has built an outstanding reputation for pioneering intuitive digital products. I am particularly drawn to your mission of democratizing developer workflows, and I would love the opportunity to bring my technical expertise and passion for design systems to your ongoing product developments.',
    closingParagraph: 'Thank you for your time and consideration. I would welcome the opportunity to discuss how my background, skill set, and passion align with the goals of Acme Technologies. I look forward to speaking with you soon.',
    signOff: 'Sincerely,\nJane Doe'
  });

  const handleCopy = () => {
    const fullText = `${details.fullName}
${details.title} | ${details.email} | ${details.phone} | ${details.location}

${details.date}

${details.recipientName}
${details.companyName}
${details.companyAddress}

${details.openingGreeting}

${details.introParagraph}

${details.bodyParagraph}

${details.companyFitParagraph}

${details.closingParagraph}

${details.signOff}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col print:p-0">
      {/* Top Controls: Hidden during print */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-900 mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Cover Letter Builder</h1>
          <p className="text-slate-400 text-sm mt-1">
            Build professional cover letters, select styled templates, copy text, and export to PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Template Switcher */}
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setTemplate('modern')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                template === 'modern' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Modern
            </button>
            <button
              onClick={() => setTemplate('classic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                template === 'classic' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Classic
            </button>
            <button
              onClick={() => setTemplate('executive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                template === 'executive' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Executive
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:text-white hover:border-slate-700 transition-all"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>

          <button
            onClick={triggerPrint}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 shadow shadow-violet-600/30 transition-all"
          >
            <Printer className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full flex-grow print:grid-cols-1 print:gap-0">
        {/* Left Form Panel: Hidden during print */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-6 space-y-4 max-h-[750px] overflow-y-auto">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-2">
              <User className="h-4 w-4 text-violet-400" /> Your Personal Info
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={details.fullName}
                  onChange={(e) => setDetails({ ...details, fullName: e.target.value })}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Title</label>
                <input
                  type="text"
                  value={details.title}
                  onChange={(e) => setDetails({ ...details, title: e.target.value })}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={details.email}
                  onChange={(e) => setDetails({ ...details, email: e.target.value })}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
                <input
                  type="text"
                  value={details.phone}
                  onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  value={details.location}
                  onChange={(e) => setDetails({ ...details, location: e.target.value })}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-2 pt-2">
              <Building className="h-4 w-4 text-violet-400" /> Recipient & Company Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hiring Manager</label>
                <input
                  type="text"
                  value={details.recipientName}
                  onChange={(e) => setDetails({ ...details, recipientName: e.target.value })}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  value={details.companyName}
                  onChange={(e) => setDetails({ ...details, companyName: e.target.value })}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-2 pt-2">
              <FileText className="h-4 w-4 text-violet-400" /> Letter Content
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Greeting</label>
              <input
                type="text"
                value={details.openingGreeting}
                onChange={(e) => setDetails({ ...details, openingGreeting: e.target.value })}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Introduction</label>
              <textarea
                value={details.introParagraph}
                rows={3}
                onChange={(e) => setDetails({ ...details, introParagraph: e.target.value })}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experience & Highlights</label>
              <textarea
                value={details.bodyParagraph}
                rows={4}
                onChange={(e) => setDetails({ ...details, bodyParagraph: e.target.value })}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Alignment / Motivation</label>
              <textarea
                value={details.companyFitParagraph}
                rows={3}
                onChange={(e) => setDetails({ ...details, companyFitParagraph: e.target.value })}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Call to Action & Sign-Off</label>
              <textarea
                value={details.closingParagraph}
                rows={3}
                onChange={(e) => setDetails({ ...details, closingParagraph: e.target.value })}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Preview Sheet Panel */}
        <div className="lg:col-span-7 flex justify-center sticky top-24 print:static print:col-span-1 print:block">
          <div
            id="cover-letter-sheet"
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-950 p-16 shadow-2xl rounded-2xl print:shadow-none print:rounded-none print:p-0 print:m-0 border border-slate-200 print:border-0 flex flex-col justify-between ${
              template === 'classic' ? 'font-serif' : 'font-sans'
            }`}
          >
            <div>
              {/* Template Header */}
              {template === 'modern' && (
                <div className="border-b-2 border-violet-600 pb-6 mb-8 flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-violet-950 uppercase">{details.fullName}</h2>
                    <p className="text-sm font-bold text-violet-600 mt-1">{details.title}</p>
                  </div>
                  <div className="text-right text-xs text-slate-600 font-medium leading-relaxed">
                    {details.email && <div>{details.email}</div>}
                    {details.phone && <div>{details.phone}</div>}
                    {details.location && <div>{details.location}</div>}
                  </div>
                </div>
              )}

              {template === 'classic' && (
                <div className="text-center border-b border-slate-300 pb-6 mb-8">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-950 uppercase">{details.fullName}</h2>
                  <p className="text-sm italic text-slate-700 mt-1">{details.title}</p>
                  <div className="mt-2 text-xs text-slate-600 space-x-2">
                    <span>{details.email}</span>
                    <span>•</span>
                    <span>{details.phone}</span>
                    <span>•</span>
                    <span>{details.location}</span>
                  </div>
                </div>
              )}

              {template === 'executive' && (
                <div className="bg-slate-900 text-white p-6 rounded-xl mb-8 flex justify-between items-center print:bg-slate-950">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight uppercase text-white">{details.fullName}</h2>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{details.title}</p>
                  </div>
                  <div className="text-right text-xs text-slate-300 font-medium">
                    <div>{details.email}</div>
                    <div>{details.phone}</div>
                  </div>
                </div>
              )}

              {/* Date & Recipient Block */}
              <div className="mb-8 text-xs leading-relaxed text-slate-800">
                <div className="font-semibold text-slate-500 mb-4">{details.date}</div>
                <div className="font-bold text-slate-950">{details.recipientName}</div>
                <div>{details.companyName}</div>
                <div>{details.companyAddress}</div>
              </div>

              {/* Greeting */}
              <div className="mb-4 text-sm font-bold text-slate-950">{details.openingGreeting}</div>

              {/* Paragraphs */}
              <div className="space-y-4 text-xs leading-relaxed text-slate-800 text-justify">
                <p>{details.introParagraph}</p>
                <p>{details.bodyParagraph}</p>
                <p>{details.companyFitParagraph}</p>
                <p>{details.closingParagraph}</p>
              </div>

              {/* Sign-off */}
              <div className="mt-8 text-xs font-medium text-slate-800 whitespace-pre-line">
                {details.signOff}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
