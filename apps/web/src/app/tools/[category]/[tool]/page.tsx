'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Sparkles, Copy, Download, RefreshCw, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { TOOLS, ToolConfig } from '@/lib/tools-config';
import UploadDropzone from '@/components/ui/UploadDropzone';
import ProcessingState from '@/components/ui/ProcessingState';
import ResultCard from '@/components/ui/ResultCard';

// Client-side processing functions
import {
  processPdfMerge,
  processPdfSplit,
  processPdfRotate,
  processPdfProtect,
  processPdfWatermark,
  processImageResize,
  processImageCompress,
  processImageConvert,
  processImageRotate,
  processImageToPdf,
  processPdfToWord,
  processImageSizeCompressor,
  processAudioConvert,
  processVideoTrim
} from '@/lib/client-processors';

function parseMarkdown(md: string): string {
  let html = md;
  
  // Escape html characters to avoid XSS injections
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (multiline)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-lg my-4 overflow-x-auto font-mono text-xs">$1</pre>');

  // Headings
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-3">$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold text-white mt-5 mb-2">$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>');

  // Blockquotes
  html = html.replace(/^&gt;\s?(.*?)$/gm, '<blockquote class="border-l-4 border-violet-500 pl-4 py-1 my-3 text-slate-400 italic bg-slate-900/30 rounded-r">$1</blockquote>');

  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code class="bg-slate-900 text-violet-400 px-1.5 py-0.5 rounded font-mono text-xs">$1</code>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-violet-400 hover:text-violet-300 underline">$1</a>');

  // Lists
  html = html.replace(/^\s*[\-\*]\s+(.*?)$/gm, '<li class="list-disc ml-5 my-1 text-slate-350">$1</li>');
  html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li class="list-decimal ml-5 my-1 text-slate-350">$1</li>');

  // Paragraph wrapping
  const blocks = html.split(/\n\n+/);
  html = blocks.map(block => {
    if (/^\s*<(h\d|pre|blockquote|li)/i.test(block)) {
      return block;
    }
    return `<p class="mb-4 leading-relaxed">${block.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  return html;
}

interface ToolPageProps {
  params: Promise<{ category: string; tool: string }>;
}

export default function ToolPage({ params: paramsPromise }: ToolPageProps) {
  const [params, setParams] = useState<{ category: string; tool: string } | null>(null);
  const [tool, setTool] = useState<ToolConfig | null>(null);

  // Flow State
  const [step, setStep] = useState<'upload' | 'options' | 'processing' | 'result'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, any>>({});
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Output Result State
  const [result, setResult] = useState<{ downloadUrl: string; name: string; size?: number; previewUrl?: string } | null>(null);

  // Custom Utility Editor States
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [passOptions, setPassOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [wordCountStats, setWordCountStats] = useState({ chars: 0, words: 0, sentences: 0, lines: 0 });

  // Resolve params promise
  useEffect(() => {
    paramsPromise.then((p) => {
      setParams(p);
      const foundTool = TOOLS.find((t) => t.category === p.category && t.id === p.tool);
      setTool(foundTool || null);

      // Pre-populate default option fields
      if (foundTool) {
        const defaults: Record<string, any> = {};
        foundTool.fields.forEach((f) => {
          defaults[f.name] = f.defaultValue;
        });
        setOptions(defaults);
      }
    });
  }, [paramsPromise]);

  // Handle file selections
  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      if (tool && !tool.multiple && tool.fields.length === 0) {
        handleProcess(selectedFiles);
      } else {
        setStep('options');
      }
    } else {
      setFiles([]);
      setStep('upload');
    }
  };

  const handleOptionChange = (name: string, value: any) => {
    setOptions((prev) => ({ ...prev, [name]: value }));
  };

  // Run file processing
  const handleProcess = async (overrideFiles?: File[]) => {
    const activeFiles = overrideFiles || files;
    if (activeFiles.length === 0 && !tool?.customLayout) return;

    setStep('processing');
    setProgress(10);
    setErrorMessage(null);

    try {
      let outputBlob: Blob | null = null;
      let outputName = 'processed_file';

      setProgress(40);

      // Map processing trigger
      if (tool?.id === 'merge') {
        const res = await processPdfMerge(activeFiles);
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.id === 'split') {
        const res = await processPdfSplit(activeFiles[0], options.pages);
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.id === 'rotate') {
        const res = await processPdfRotate(activeFiles[0], options.angle);
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.id === 'protect') {
        const res = await processPdfProtect(activeFiles[0], options.password);
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.id === 'watermark') {
        const res = await processPdfWatermark(activeFiles[0], options.text, options.fontSize, options.opacity);
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.id === 'resize') {
        const res = await processImageResize(activeFiles[0], options.width, options.height, options.maintainAspectRatio);
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.id === 'compress' || tool?.id === 'image-data-compresser') {
        const res = await processImageCompress(activeFiles[0], options.quality);
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.id === 'image-to-pdf') {
        const res = await processImageToPdf(activeFiles);
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.id === 'pdf-to-word') {
        const res = await processPdfToWord(activeFiles[0]);
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.id === 'image-size-compressor') {
        const res = await processImageSizeCompressor(activeFiles[0], options.targetSizeKB);
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.id === 'convert') {
        const res = await processImageConvert(activeFiles[0], options.format);
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.id === 'rotate-image') {
        const res = await processImageRotate(activeFiles[0], options.angle);
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.id === 'audio-convert') {
        const res = await processAudioConvert(activeFiles[0], options.format);
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.id === 'video-trim') {
        const start = Number(options.start || 0);
        const end = Number(options.end || 10);
        const res = await processVideoTrim(activeFiles[0], start, end, (p) => {
          setProgress(Math.floor(40 + p * 0.5)); // Map 0-100% video trim to 40-90% overall progress
        });
        outputBlob = res.blob;
        outputName = res.name;
      } else if (tool?.category === 'video' || tool?.category === 'audio') {
        const fileBytes = await activeFiles[0].arrayBuffer();
        outputBlob = new Blob([fileBytes], { type: activeFiles[0].type || 'video/mp4' });
        const orig = activeFiles[0].name.substring(0, activeFiles[0].name.lastIndexOf('.')) || 'media';
        outputName = `${orig}_trimmed.${activeFiles[0].name.split('.').pop() || 'mp4'}`;
      }

      setProgress(80);

      if (outputBlob) {
        const downloadUrl = URL.createObjectURL(outputBlob);
        setResult({
          downloadUrl,
          name: outputName,
          size: outputBlob.size,
          previewUrl: (outputBlob.type.startsWith('image/') || outputBlob.type === 'application/pdf') ? downloadUrl : undefined
        });
        setProgress(100);

        // Auto-trigger download (iLovePDF style)
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = outputName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => setStep('result'), 300);
      } else {
        throw new Error('Processing failed to yield output file.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during file processing.');
      setStep('options');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setStep('upload');
  };

  // --- UTILITY WIDGET ACTIONS ---

  // QR Code
  useEffect(() => {
    if (tool?.id === 'qr-generator' && inputText) {
      QRCode.toDataURL(inputText, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [tool, inputText]);

  // Password Generator
  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const num = '0123456789';
    const sym = '!@#$%^&*()_+~`|}{[]:;?><,./-+=';

    let pool = '';
    if (passOptions.uppercase) pool += upper;
    if (passOptions.lowercase) pool += lower;
    if (passOptions.numbers) pool += num;
    if (passOptions.symbols) pool += sym;

    if (!pool) {
      setOutputText('Please select at least one option.');
      return;
    }

    let password = '';
    for (let i = 0; i < passOptions.length; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      password += pool[idx];
    }
    setOutputText(password);
  };

  // JSON Formatter
  const formatJson = (minify = false) => {
    try {
      const parsed = JSON.parse(inputText);
      setOutputText(minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2));
      setErrorMessage(null);
    } catch (e: any) {
      setErrorMessage(`Invalid JSON: ${e.message}`);
    }
  };

  // Word Counter
  const handleWordCounterChange = (text: string) => {
    setInputText(text);
    const chars = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
    const lines = text.split('\n').length;
    setWordCountStats({ chars, words, sentences, lines });
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Text exporter
  const exportTextFile = (ext: 'txt' | 'html' | 'md' | 'json') => {
    const mime = ext === 'html' ? 'text/html' : ext === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([outputText || inputText], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filedeck_export.${ext}`;
    a.click();
  };

  if (!tool) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h2 className="text-xl font-semibold text-white">Tool Not Found</h2>
        <p className="mt-2 text-slate-400">The requested utility does not exist or has been moved.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-violet-500 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      {/* Tool Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-900 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <tool.icon className="h-8 w-8 text-violet-500" />
            {tool.name}
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">{tool.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-400 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            Client-Side processing
          </span>
        </div>
      </div>

      {/* General Upload UX Flow */}
      {!tool.customLayout && (
        <div className="w-full min-h-[400px]">
          {step === 'upload' && (
            <UploadDropzone
              onFilesSelected={handleFilesSelected}
              accept={tool.accept}
              maxSizeMB={tool.maxSizeMB}
              multiple={tool.multiple}
              description={`Supported extensions: ${tool.accept || 'Any'} (Max ${tool.maxSizeMB}MB)`}
            />
          )}

          {step === 'options' && (
            <div className="max-w-xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6">Configure Options</h3>

              {errorMessage && (
                <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-3.5 text-sm text-red-400 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-5">
                {tool.fields.map((field) => (
                  <div key={field.name} className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">{field.label}</label>

                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={options[field.name] || ''}
                        onChange={(e) => handleOptionChange(field.name, e.target.value)}
                        className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={options[field.name] || 0}
                        onChange={(e) => handleOptionChange(field.name, parseInt(e.target.value, 10))}
                        className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
                      />
                    )}

                    {field.type === 'password' && (
                      <input
                        type="password"
                        placeholder="Enter password to secure file"
                        value={options[field.name] || ''}
                        onChange={(e) => handleOptionChange(field.name, e.target.value)}
                        className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
                      />
                    )}

                    {field.type === 'slider' && (
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={options[field.name] || 0}
                          onChange={(e) => handleOptionChange(field.name, parseFloat(e.target.value))}
                          className="w-full accent-violet-500"
                        />
                        <span className="text-sm font-semibold text-slate-400 w-12 text-right">
                          {options[field.name]}
                        </span>
                      </div>
                    )}

                    {field.type === 'checkbox' && (
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!options[field.name]}
                          onChange={(e) => handleOptionChange(field.name, e.target.checked)}
                          className="h-5 w-5 rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500 accent-violet-500"
                        />
                        <span className="text-sm text-slate-400">Enabled</span>
                      </label>
                    )}

                    {field.type === 'select' && (
                      <select
                        value={options[field.name] || ''}
                        onChange={(e) => handleOptionChange(field.name, e.target.value)}
                        className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none transition-colors"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={handleReset}
                  className="w-full rounded-xl border border-slate-850 bg-slate-950 px-4 py-3.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleProcess()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/30"
                >
                  <Play className="h-4 w-4" />
                  Process File
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && <ProcessingState progress={progress} />}

          {step === 'result' && result && (
            <ResultCard
              downloadUrl={result.downloadUrl}
              fileName={result.name}
              fileSizeBytes={result.size}
              previewUrl={result.previewUrl}
              onReset={handleReset}
            />
          )}
        </div>
      )}

      {/* --- CUSTOM UTILITY WORKSPACE LAYOUTS --- */}

      {/* QR Code Workspace */}
      {tool.id === 'qr-generator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/40 rounded-2xl border border-slate-800 p-8 shadow-xl">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white">QR Code Settings</h3>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-400">Content / Target URL</label>
              <input
                type="text"
                value={inputText}
                placeholder="https://example.com or plain text"
                onChange={(e) => setInputText(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-8 md:pt-0 md:pl-8">
            {qrCodeUrl ? (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
                  <img src={qrCodeUrl} alt="Generated QR Code" className="w-[200px] h-[200px]" />
                </div>
                <a
                  href={qrCodeUrl}
                  download="filedeck_qrcode.png"
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-all shadow shadow-violet-600/30"
                >
                  <Download className="h-4 w-4" /> Download PNG
                </a>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Enter text to generate a QR Code</p>
            )}
          </div>
        </div>
      )}

      {/* Password Generator Workspace */}
      {tool.id === 'password-generator' && (
        <div className="max-w-xl mx-auto bg-slate-900/40 rounded-2xl border border-slate-800 p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">Password Customization</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-semibold text-slate-400">
                <span>Password Length</span>
                <span>{passOptions.length} characters</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={passOptions.length}
                onChange={(e) => setPassOptions({ ...passOptions, length: parseInt(e.target.value, 10) })}
                className="w-full accent-violet-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={passOptions.uppercase}
                  onChange={(e) => setPassOptions({ ...passOptions, uppercase: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-855 bg-slate-950 text-violet-600 accent-violet-500"
                />
                <span className="text-sm text-slate-300">A-Z (Uppercase)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={passOptions.lowercase}
                  onChange={(e) => setPassOptions({ ...passOptions, lowercase: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-855 bg-slate-950 text-violet-600 accent-violet-500"
                />
                <span className="text-sm text-slate-300">a-z (Lowercase)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={passOptions.numbers}
                  onChange={(e) => setPassOptions({ ...passOptions, numbers: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-855 bg-slate-950 text-violet-600 accent-violet-500"
                />
                <span className="text-sm text-slate-300">0-9 (Numbers)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={passOptions.symbols}
                  onChange={(e) => setPassOptions({ ...passOptions, symbols: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-855 bg-slate-950 text-violet-600 accent-violet-500"
                />
                <span className="text-sm text-slate-300">!@#$ (Special Characters)</span>
              </label>
            </div>

            <button
              onClick={generatePassword}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white hover:bg-violet-500 transition-all font-medium mt-6 shadow shadow-violet-600/30"
            >
              <RefreshCw className="h-4 w-4" /> Generate Password
            </button>

            {outputText && (
              <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between">
                <span className="font-mono text-white text-base select-all overflow-x-auto pr-4">{outputText}</span>
                <button
                  onClick={() => copyToClipboard(outputText)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg shrink-0 transition-colors"
                  title="Copy password"
                >
                  <Copy className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* JSON Formatter Workspace */}
      {tool.id === 'json-formatter' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-400">Input Raw JSON</span>
              <button
                onClick={() => copyToClipboard(inputText)}
                className="text-xs text-slate-500 hover:text-white transition-colors"
              >
                Copy Raw
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder='{"key": "value"}'
              className="h-96 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm text-white focus:border-violet-500 focus:outline-none resize-none"
            />
            <div className="flex gap-2.5">
              <button
                onClick={() => formatJson(false)}
                className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white transition-all shadow shadow-violet-600/20"
              >
                Prettify / Format
              </button>
              <button
                onClick={() => formatJson(true)}
                className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300 transition-colors"
              >
                Minify
              </button>
            </div>
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="truncate">{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-400">Formatted Output</span>
              {outputText && (
                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(outputText)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </button>
                  <button
                    onClick={() => exportTextFile('json')}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </div>
              )}
            </div>
            <textarea
              readOnly
              value={outputText}
              placeholder="Output will appear here..."
              className="h-96 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm text-white focus:outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* Word Counter Workspace */}
      {tool.id === 'word-counter' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-3">
            <span className="text-sm font-semibold text-slate-400 font-medium">Type or Paste Text</span>
            <textarea
              value={inputText}
              onChange={(e) => handleWordCounterChange(e.target.value)}
              placeholder="Start typing your text here..."
              className="h-96 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-white focus:border-violet-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-sm font-semibold text-slate-400 font-medium">Statistics</span>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-4 text-center">
                <p className="text-2xl font-bold text-white">{wordCountStats.words}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Words</p>
              </div>
              <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-4 text-center">
                <p className="text-2xl font-bold text-white">{wordCountStats.chars}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Characters</p>
              </div>
              <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-4 text-center">
                <p className="text-2xl font-bold text-white">{wordCountStats.sentences}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Sentences</p>
              </div>
              <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-4 text-center">
                <p className="text-2xl font-bold text-white">{wordCountStats.lines}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Paragraphs</p>
              </div>
            </div>
            <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Estimated reading time</span>
                <span className="font-semibold text-white">
                  {Math.ceil(wordCountStats.words / 200)} min
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Estimated speaking time</span>
                <span className="font-semibold text-white">
                  {Math.ceil(wordCountStats.words / 130)} min
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rich Text & Markdown Editors */}
      {(tool.id === 'text-editor' || tool.id === 'markdown-editor') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 rounded-2xl border border-slate-800 p-6 shadow-xl">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-400">Editor</span>
              <button
                onClick={() => exportTextFile(tool.id === 'markdown-editor' ? 'md' : 'html')}
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold"
              >
                <Download className="h-4 w-4" /> Export File
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                tool.id === 'markdown-editor'
                  ? '# Hello Markdown\n\nWrite some markdown here...\n- Bullet 1\n- Bullet 2'
                  : '<h1>Hello World</h1>\n<p>Write raw HTML text here...</p>'
              }
              className="h-96 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm text-white focus:border-violet-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-slate-400">Live Preview</span>
            <div
              className="h-96 rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-y-auto text-slate-300 prose prose-invert prose-sm"
              dangerouslySetInnerHTML={{
                __html: tool.id === 'markdown-editor' ? parseMarkdown(inputText) : inputText
              }}
            />
          </div>
        </div>
      )}

      {/* Word Editor Workspace */}
      {tool.id === 'word-editor' && (
        <div className="flex flex-col gap-4 bg-slate-900/40 rounded-2xl border border-slate-800 p-6 shadow-xl w-full">
          <div className="flex flex-wrap gap-2 items-center p-2 bg-slate-950 rounded-xl border border-slate-850 print:hidden text-slate-350">
            <button
              onClick={() => document.execCommand('bold', false)}
              className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 hover:text-white font-bold text-xs"
              title="Bold"
            >
              B
            </button>
            <button
              onClick={() => document.execCommand('italic', false)}
              className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 hover:text-white italic text-xs"
              title="Italic"
            >
              I
            </button>
            <button
              onClick={() => document.execCommand('underline', false)}
              className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 hover:text-white underline text-xs"
              title="Underline"
            >
              U
            </button>
            <div className="h-4 w-px bg-slate-800 mx-1"></div>
            <select
              onChange={(e) => document.execCommand('fontName', false, e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
            <select
              onChange={(e) => document.execCommand('fontSize', false, e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
            >
              <option value="3">Normal</option>
              <option value="5">Heading 2</option>
              <option value="6">Heading 1</option>
              <option value="1">Small</option>
            </select>
            <div className="h-4 w-px bg-slate-800 mx-1"></div>
            <button
              onClick={() => document.execCommand('justifyLeft', false)}
              className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 hover:text-white text-xs font-semibold"
              title="Align Left"
            >
              Left
            </button>
            <button
              onClick={() => document.execCommand('justifyCenter', false)}
              className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 hover:text-white text-xs font-semibold"
              title="Align Center"
            >
              Center
            </button>
            <button
              onClick={() => document.execCommand('justifyRight', false)}
              className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 hover:text-white text-xs font-semibold"
              title="Align Right"
            >
              Right
            </button>
            <div className="h-4 w-px bg-slate-800 mx-1"></div>
            <button
              onClick={() => {
                const editor = document.getElementById('word-editor-sheet');
                if (editor) {
                  const docHtml = `
                    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
                    <head><meta charset="utf-8"></head>
                    <body>${editor.innerHTML}</body>
                    </html>
                  `;
                  const blob = new Blob([docHtml], { type: 'application/msword' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'filedeck_word_doc.doc';
                  a.click();
                }
              }}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs text-white px-3.5 py-1.5 font-bold transition-all ml-auto shadow shadow-violet-600/30"
            >
              <Download className="h-3.5 w-3.5" /> Export Word Doc (.doc)
            </button>
          </div>
          <div className="w-full bg-slate-950 p-6 rounded-xl border border-slate-850 min-h-[500px] flex justify-center">
            <div
              id="word-editor-sheet"
              contentEditable={true}
              className="w-[210mm] min-h-[297mm] bg-white text-slate-950 p-12 shadow-2xl rounded border border-slate-200 focus:outline-none prose prose-slate"
              style={{ padding: '40px', boxSizing: 'border-box' }}
              dangerouslySetInnerHTML={{
                __html: '<h2>Draft Document</h2><p>Start drafting your Word document directly in A4 sheet layout. Add text, set header formatting, and export it as an MS Word-compliant file.</p>'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
