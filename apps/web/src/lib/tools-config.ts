import {
  FileText,
  Image as ImageIcon,
  Settings,
  Music,
  Video,
  Sparkles,
  Columns,
  RotateCw,
  Scissors,
  FileCode,
  QrCode,
  Key,
  Hash,
  RefreshCw,
  Scale
} from 'lucide-react';

export interface ToolField {
  name: string;
  label: string;
  type: 'select' | 'text' | 'number' | 'slider' | 'password' | 'checkbox';
  defaultValue: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ToolConfig {
  id: string;
  name: string;
  category: 'pdf' | 'image' | 'document' | 'audio' | 'video' | 'utilities';
  description: string;
  icon: any;
  accept: string;
  maxSizeMB: number;
  multiple: boolean;
  fields: ToolField[];
  customLayout?: boolean; // For tools like text editor that don't follow upload UX
}

export const TOOL_CATEGORIES = {
  pdf: { name: 'PDF Tools', icon: FileText, color: 'from-rose-500/20 to-red-500/20 text-rose-500' },
  image: { name: 'Image Tools', icon: ImageIcon, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-500' },
  document: { name: 'Document Tools', icon: FileText, color: 'from-blue-500/20 to-cyan-500/20 text-blue-500' },
  audio: { name: 'Audio Tools', icon: Music, color: 'from-amber-500/20 to-orange-500/20 text-amber-500' },
  video: { name: 'Video Tools', icon: Video, color: 'from-indigo-500/20 to-violet-500/20 text-indigo-500' },
  utilities: { name: 'Utilities', icon: Settings, color: 'from-slate-500/20 to-zinc-500/20 text-slate-400' },
};

export const TOOLS: ToolConfig[] = [
  // PDF TOOLS
  {
    id: 'merge',
    name: 'Merge PDF',
    category: 'pdf',
    description: 'Combine multiple PDF files into a single document in your preferred order.',
    icon: Columns,
    accept: '.pdf',
    maxSizeMB: 50,
    multiple: true,
    fields: []
  },
  {
    id: 'split',
    name: 'Split PDF',
    category: 'pdf',
    description: 'Extract specific pages or ranges from a PDF file.',
    icon: Scissors,
    accept: '.pdf',
    maxSizeMB: 50,
    multiple: false,
    fields: [
      { name: 'pages', label: 'Page ranges (e.g. 1-3, 5, 7-10)', type: 'text', defaultValue: '1' }
    ]
  },
  {
    id: 'rotate',
    name: 'Rotate PDF',
    category: 'pdf',
    description: 'Rotate PDF pages by 90, 180, or 270 degrees clockwise.',
    icon: RotateCw,
    accept: '.pdf',
    maxSizeMB: 50,
    multiple: false,
    fields: [
      {
        name: 'angle',
        label: 'Rotation Angle',
        type: 'select',
        defaultValue: '90',
        options: [
          { label: '90° Clockwise', value: '90' },
          { label: '180°', value: '180' },
          { label: '270° Counter-Clockwise', value: '270' }
        ]
      }
    ]
  },
  {
    id: 'protect',
    name: 'Protect PDF',
    category: 'pdf',
    description: 'Encrypt and secure your PDF document with a password.',
    icon: Key,
    accept: '.pdf',
    maxSizeMB: 50,
    multiple: false,
    fields: [
      { name: 'password', label: 'Password', type: 'password', defaultValue: '' }
    ]
  },
  {
    id: 'watermark',
    name: 'Add Watermark',
    category: 'pdf',
    description: 'Add a text overlay or watermark stamp to your PDF pages.',
    icon: Sparkles,
    accept: '.pdf',
    maxSizeMB: 50,
    multiple: false,
    fields: [
      { name: 'text', label: 'Watermark Text', type: 'text', defaultValue: 'CONFIDENTIAL' },
      { name: 'fontSize', label: 'Font Size', type: 'number', defaultValue: 50 },
      { name: 'opacity', label: 'Opacity (0-1)', type: 'slider', defaultValue: 0.3, min: 0.1, max: 1, step: 0.1 }
    ]
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    category: 'pdf',
    description: 'Convert one or more images into a single PDF document.',
    icon: ImageIcon,
    accept: 'image/*',
    maxSizeMB: 50,
    multiple: true,
    fields: []
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    category: 'pdf',
    description: 'Convert PDF document into editable Microsoft Word (.doc) format.',
    icon: FileText,
    accept: '.pdf',
    maxSizeMB: 50,
    multiple: false,
    fields: []
  },

  // IMAGE TOOLS
  {
    id: 'resize',
    name: 'Resize Image',
    category: 'image',
    description: 'Resize image dimensions by width and height pixels.',
    icon: Columns,
    accept: 'image/*',
    maxSizeMB: 20,
    multiple: false,
    fields: [
      { name: 'width', label: 'Width (px)', type: 'number', defaultValue: 800 },
      { name: 'height', label: 'Height (px)', type: 'number', defaultValue: 600 },
      { name: 'maintainAspectRatio', label: 'Maintain Aspect Ratio', type: 'checkbox', defaultValue: true }
    ]
  },
  {
    id: 'compress',
    name: 'Compress Image',
    category: 'image',
    description: 'Compress images to reduce size while retaining quality.',
    icon: Scale,
    accept: 'image/jpeg,image/png,image/webp',
    maxSizeMB: 20,
    multiple: false,
    fields: [
      { name: 'quality', label: 'Compression Quality', type: 'slider', defaultValue: 80, min: 10, max: 100, step: 5 }
    ]
  },
  {
    id: 'image-data-compresser',
    name: 'Image Data Compresser',
    category: 'image',
    description: 'Compress image metadata and pixel data to reduce weight and disk footprint.',
    icon: Scale,
    accept: 'image/*',
    maxSizeMB: 50,
    multiple: false,
    fields: [
      { name: 'quality', label: 'Compression Ratio', type: 'slider', defaultValue: 75, min: 10, max: 100, step: 5 }
    ]
  },
  {
    id: 'image-size-compressor',
    name: 'Image Size Compressor',
    category: 'image',
    description: 'Compress an image to fit under a specific target file size (e.g. under 200 KB) automatically.',
    icon: Scale,
    accept: 'image/jpeg,image/png,image/webp',
    maxSizeMB: 50,
    multiple: false,
    fields: [
      { name: 'targetSizeKB', label: 'Target Size (KB)', type: 'number', defaultValue: 200 }
    ]
  },
  {
    id: 'convert',
    name: 'Convert Image',
    category: 'image',
    description: 'Convert images to PNG, JPEG, or WebP format.',
    icon: RefreshCw,
    accept: 'image/*',
    maxSizeMB: 20,
    multiple: false,
    fields: [
      {
        name: 'format',
        label: 'Target Format',
        type: 'select',
        defaultValue: 'png',
        options: [
          { label: 'PNG (.png)', value: 'png' },
          { label: 'JPEG (.jpg)', value: 'jpeg' },
          { label: 'WebP (.webp)', value: 'webp' }
        ]
      }
    ]
  },
  {
    id: 'rotate-image',
    name: 'Rotate Image',
    category: 'image',
    description: 'Rotate images clockwise.',
    icon: RotateCw,
    accept: 'image/*',
    maxSizeMB: 20,
    multiple: false,
    fields: [
      {
        name: 'angle',
        label: 'Rotation',
        type: 'select',
        defaultValue: '90',
        options: [
          { label: '90° Right', value: '90' },
          { label: '180° Flip', value: '180' },
          { label: '90° Left (270°)', value: '270' }
        ]
      }
    ]
  },

  // DOCUMENT EDITORS (Interactive layout)
  {
    id: 'text-editor',
    name: 'Rich Text Editor',
    category: 'document',
    description: 'Create and write formatted text directly in your browser, then export to HTML or TXT.',
    icon: FileText,
    accept: '.txt,.html',
    maxSizeMB: 5,
    multiple: false,
    fields: [],
    customLayout: true
  },
  {
    id: 'word-editor',
    name: 'Word Document Editor',
    category: 'document',
    description: 'Compose and format text documents in an A4 sheet visualizer, and export directly as MS Word (.doc) files.',
    icon: FileText,
    accept: '.doc,.docx,.txt',
    maxSizeMB: 10,
    multiple: false,
    fields: [],
    customLayout: true
  },
  {
    id: 'markdown-editor',
    name: 'Markdown Editor',
    category: 'document',
    description: 'Compose Markdown code with a live preview visualizer.',
    icon: FileCode,
    accept: '.md',
    maxSizeMB: 5,
    multiple: false,
    fields: [],
    customLayout: true
  },

  // UTILITY TOOLS
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    category: 'utilities',
    description: 'Create customizable QR Codes for URLs, text, contacts, or passwords.',
    icon: QrCode,
    accept: '',
    maxSizeMB: 0,
    multiple: false,
    fields: [
      { name: 'text', label: 'QR Target URL / Text', type: 'text', defaultValue: 'https://filedeck.org' },
      { name: 'size', label: 'Size (pixels)', type: 'number', defaultValue: 256 },
      { name: 'color', label: 'QR Color', type: 'text', defaultValue: '#000000' }
    ],
    customLayout: true
  },
  {
    id: 'password-generator',
    name: 'Secure Password Generator',
    category: 'utilities',
    description: 'Generate customizable, highly secure passwords to protect your accounts.',
    icon: Key,
    accept: '',
    maxSizeMB: 0,
    multiple: false,
    fields: [
      { name: 'length', label: 'Password Length', type: 'slider', defaultValue: 16, min: 8, max: 64, step: 1 },
      { name: 'uppercase', label: 'Include Uppercase (A-Z)', type: 'checkbox', defaultValue: true },
      { name: 'lowercase', label: 'Include Lowercase (a-z)', type: 'checkbox', defaultValue: true },
      { name: 'numbers', label: 'Include Numbers (0-9)', type: 'checkbox', defaultValue: true },
      { name: 'symbols', label: 'Include Symbols (!@#$...)', type: 'checkbox', defaultValue: true }
    ],
    customLayout: true
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    category: 'utilities',
    description: 'Prettify, format, validate, and minify your JSON data.',
    icon: FileCode,
    accept: '',
    maxSizeMB: 0,
    multiple: false,
    fields: [],
    customLayout: true
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    category: 'utilities',
    description: 'Count words, characters, sentences, paragraphs, and estimate reading time.',
    icon: Hash,
    accept: '',
    maxSizeMB: 0,
    multiple: false,
    fields: [],
    customLayout: true
  },

  // AUDIO & VIDEO SKELETONS
  {
    id: 'audio-convert',
    name: 'Audio Converter',
    category: 'audio',
    description: 'Convert audio tracks between MP3, WAV, M4A, and OGG.',
    icon: Music,
    accept: 'audio/*',
    maxSizeMB: 50,
    multiple: false,
    fields: [
      {
        name: 'format',
        label: 'Target Format',
        type: 'select',
        defaultValue: 'mp3',
        options: [
          { label: 'MP3 (.mp3)', value: 'mp3' },
          { label: 'WAV (.wav)', value: 'wav' },
          { label: 'M4A (.m4a)', value: 'm4a' }
        ]
      }
    ]
  },
  {
    id: 'video-trim',
    name: 'Trim Video',
    category: 'video',
    description: 'Cut out desired ranges of a video by start/end seconds.',
    icon: Video,
    accept: 'video/*',
    maxSizeMB: 100,
    multiple: false,
    fields: [
      { name: 'start', label: 'Start Time (seconds)', type: 'number', defaultValue: 0 },
      { name: 'end', label: 'End Time (seconds)', type: 'number', defaultValue: 10 }
    ]
  }
];
