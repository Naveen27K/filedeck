'use client';

import React, { useState, useRef } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  description?: string;
}

export default function UploadDropzone({
  onFilesSelected,
  accept = '*/*',
  maxSizeMB = 50,
  multiple = false,
  description = 'Any file up to 50MB',
}: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateFiles = (files: FileList): File[] => {
    setError(null);
    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Size validation
      if (file.size > maxSizeBytes) {
        setError(`File "${file.name}" exceeds the ${maxSizeMB}MB size limit.`);
        return [];
      }

      // Flexible type & extension validation
      if (accept && accept !== '*/*' && accept !== '*') {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const acceptedTokens = accept.split(',').map((x) => x.trim().toLowerCase());

        const isAccepted = acceptedTokens.some((token) => {
          // Extension match (.pdf, .png, .jpg, etc.)
          if (token.startsWith('.')) {
            return token === fileExtension;
          }
          // Category MIME match (image/*, audio/*, video/*)
          if (token.endsWith('/*')) {
            const category = token.split('/')[0];
            return file.type ? file.type.startsWith(category) : true;
          }
          // Exact MIME match
          if (file.type && file.type === token) {
            return true;
          }
          // Cross-MIME extension aliases
          if (token === 'image/jpeg' && (fileExtension === '.jpg' || fileExtension === '.jpeg')) return true;
          if (token === 'image/png' && fileExtension === '.png') return true;
          if (token === 'image/webp' && fileExtension === '.webp') return true;
          if (token === 'application/pdf' && fileExtension === '.pdf') return true;

          // Token substring match (e.g. image/png -> png match)
          const tokenSub = token.split('/')[1];
          if (tokenSub && (fileExtension === `.${tokenSub}` || fileExtension === `.${tokenSub}e`)) return true;

          return true; // Fallback to accept file if ambiguous
        });

        if (!isAccepted) {
          setError(`File "${file.name}" is not supported by this tool.`);
          return [];
        }
      }

      validFiles.push(file);
      if (!multiple) break;
    }

    return validFiles;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = validateFiles(e.dataTransfer.files);
      if (files.length > 0) {
        setSelectedFiles(files);
        onFilesSelected(files);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const files = validateFiles(e.target.files);
      if (files.length > 0) {
        setSelectedFiles(files);
        onFilesSelected(files);
      }
    }
  };

  const removeFile = (index: number) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    setSelectedFiles(updated);
    onFilesSelected(updated);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-violet-500 bg-violet-950/20'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800/80 text-slate-400 group-hover:scale-105 group-hover:text-violet-400 group-hover:bg-violet-900/20 shadow-md transition-all duration-300">
          <Upload className="h-6 w-6" />
        </div>

        <h3 className="mt-4 text-base font-semibold text-white">
          Drag & drop your {multiple ? 'files' : 'file'} here, or{' '}
          <span className="text-violet-500 group-hover:text-violet-400 group-hover:underline transition-colors">
            browse
          </span>
        </h3>
        <p className="mt-1.5 text-xs text-slate-500">{description}</p>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3.5 text-sm text-red-400 border border-red-500/20 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Selected Files</p>
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                  <File className="h-5 w-5" />
                </div>
                <div className="overflow-hidden text-left">
                  <p className="truncate text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
