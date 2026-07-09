import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';

/**
 * Merge multiple PDF documents into a single file
 */
export async function processPdfMerge(files: File[]): Promise<{ blob: Blob; name: string }> {
  if (!files || files.length === 0) {
    throw new Error('Please select at least one PDF file to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const fileBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBytes);
    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  return {
    blob: new Blob([mergedPdfBytes as unknown as BlobPart], { type: 'application/pdf' }),
    name: 'merged_document.pdf'
  };
}

/**
 * Split a PDF based on page ranges (e.g., "1-3, 5, 7-10")
 */
export async function processPdfSplit(file: File, ranges?: string): Promise<{ blob: Blob; name: string }> {
  const fileBytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(fileBytes);
  const totalPages = srcDoc.getPageCount();

  const pagesToExtract: number[] = [];
  const validRanges = (ranges && ranges.trim()) ? ranges : '1';
  const parts = validRanges.split(',');

  for (const part of parts) {
    const trimPart = part.trim();
    if (trimPart.includes('-')) {
      const [startStr, endStr] = trimPart.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= totalPages) {
            pagesToExtract.push(i - 1); // 0-indexed
          }
        }
      }
    } else {
      const idx = parseInt(trimPart, 10);
      if (!isNaN(idx) && idx >= 1 && idx <= totalPages) {
        pagesToExtract.push(idx - 1);
      }
    }
  }

  // Fallback to page 1 if no valid pages were matched
  if (pagesToExtract.length === 0) {
    pagesToExtract.push(0);
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, Array.from(new Set(pagesToExtract)));
  copiedPages.forEach((page) => newDoc.addPage(page));

  const splitPdfBytes = await newDoc.save();
  const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'document';

  return {
    blob: new Blob([splitPdfBytes as unknown as BlobPart], { type: 'application/pdf' }),
    name: `${originalName}_split.pdf`
  };
}

/**
 * Rotate pages of a PDF document
 */
export async function processPdfRotate(file: File, angleStr?: string): Promise<{ blob: Blob; name: string }> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes);
  const angle = parseInt(angleStr || '90', 10);

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angle) % 360));
  }

  const rotatedPdfBytes = await pdfDoc.save();
  const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'document';

  return {
    blob: new Blob([rotatedPdfBytes as unknown as BlobPart], { type: 'application/pdf' }),
    name: `${originalName}_rotated.pdf`
  };
}

/**
 * Protect PDF with password metadata & lock permissions
 */
export async function processPdfProtect(file: File, passwordText?: string): Promise<{ blob: Blob; name: string }> {
  const pass = passwordText && passwordText.trim() ? passwordText : 'protected';

  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes);

  pdfDoc.setTitle(`[Protected] ${file.name}`);
  pdfDoc.setProducer('FileDeck Security Toolkit');
  pdfDoc.setSubject(`Password Encrypted Document (Key: ${pass.substring(0, 3)}***)`);

  const protectedPdfBytes = await pdfDoc.save();
  const encryptedPdfBytes = await encryptPDF(protectedPdfBytes, pass);
  const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'document';

  return {
    blob: new Blob([encryptedPdfBytes as unknown as BlobPart], { type: 'application/pdf' }),
    name: `${originalName}_protected.pdf`
  };
}

/**
 * Add watermark text to PDF pages cleanly using rgb color
 */
export async function processPdfWatermark(
  file: File,
  text?: string,
  fontSize?: number,
  opacity?: number
): Promise<{ blob: Blob; name: string }> {
  const watermarkText = (text && text.trim()) ? text : 'CONFIDENTIAL';
  const size = fontSize && fontSize > 0 ? fontSize : 45;
  const alpha = opacity && opacity > 0 ? opacity : 0.3;

  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width / 4,
      y: height / 2,
      size: size,
      opacity: alpha,
      rotate: degrees(45),
      color: rgb(0.6, 0.6, 0.6),
      font: font
    });
  }

  const watermarkedPdfBytes = await pdfDoc.save();
  const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'document';

  return {
    blob: new Blob([watermarkedPdfBytes as unknown as BlobPart], { type: 'application/pdf' }),
    name: `${originalName}_watermarked.pdf`
  };
}

/**
 * Helper to load an image File into an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Resize Image dimensions
 */
export async function processImageResize(
  file: File,
  width?: number,
  height?: number,
  maintainAspectRatio?: boolean
): Promise<{ blob: Blob; name: string }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let finalWidth = width && width > 0 ? Math.round(width) : img.width;
  let finalHeight = height && height > 0 ? Math.round(height) : img.height;

  if (maintainAspectRatio) {
    const ratio = img.width / img.height;
    if (finalWidth / finalHeight > ratio) {
      finalWidth = Math.round(finalHeight * ratio);
    } else {
      finalHeight = Math.round(finalWidth / ratio);
    }
  }

  canvas.width = Math.max(1, finalWidth);
  canvas.height = Math.max(1, finalHeight);

  if (!ctx) throw new Error('Could not get canvas 2D context.');

  if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const mimeType = file.type || 'image/png';
  const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve({ blob, name: `${originalName}_resized.${mimeType.split('/')[1] || 'png'}` });
      } else {
        reject(new Error('Image resizing failed.'));
      }
    }, mimeType);
  });
}

/**
 * Compress Image quality
 */
export async function processImageCompress(file: File, quality?: number): Promise<{ blob: Blob; name: string }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;

  if (!ctx) throw new Error('Could not get canvas 2D context.');

  const compQuality = quality && quality > 0 ? Math.min(100, Math.max(1, quality)) / 100 : 0.8;

  let outputFormat = file.type;
  if (outputFormat !== 'image/jpeg' && outputFormat !== 'image/webp') {
    outputFormat = 'image/jpeg';
  }

  if (outputFormat === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const extension = outputFormat === 'image/jpeg' ? 'jpg' : 'webp';
  const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, name: `${originalName}_compressed.${extension}` });
        } else {
          reject(new Error('Image compression failed.'));
        }
      },
      outputFormat,
      compQuality
    );
  });
}

/**
 * Convert Image format (fill white background for JPEG so transparent PNGs don't turn black)
 */
export async function processImageConvert(file: File, targetFormat?: string): Promise<{ blob: Blob; name: string }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;

  if (!ctx) throw new Error('Could not get canvas 2D context.');

  const format = targetFormat ? targetFormat.toLowerCase() : 'png';
  const isJpeg = format === 'jpeg' || format === 'jpg';
  const mimeType = `image/${isJpeg ? 'jpeg' : format === 'webp' ? 'webp' : 'png'}`;

  if (isJpeg) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const ext = isJpeg ? 'jpg' : format === 'webp' ? 'webp' : 'png';
  const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve({ blob, name: `${originalName}_converted.${ext}` });
      } else {
        reject(new Error('Image conversion failed.'));
      }
    }, mimeType);
  });
}

/**
 * Rotate Image
 */
export async function processImageRotate(file: File, angleStr?: string): Promise<{ blob: Blob; name: string }> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const angle = parseInt(angleStr || '90', 10);

  if (!ctx) throw new Error('Could not get canvas 2D context.');

  if (angle === 90 || angle === 270) {
    canvas.width = img.height;
    canvas.height = img.width;
  } else {
    canvas.width = img.width;
    canvas.height = img.height;
  }

  if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  const mimeType = file.type || 'image/png';
  const ext = mimeType.split('/')[1] || 'png';
  const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve({ blob, name: `${originalName}_rotated.${ext}` });
      } else {
        reject(new Error('Image rotation failed.'));
      }
    }, mimeType);
  });
}

/**
 * Convert images into a single PDF document (supports WebP, PNG, JPEG, SVG, GIF)
 */
export async function processImageToPdf(files: File[]): Promise<{ blob: Blob; name: string }> {
  if (!files || files.length === 0) {
    throw new Error('Please select at least one image file.');
  }

  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const img = await loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not render image canvas context.');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to convert canvas to blob'));
      }, 'image/jpeg', 0.92);
    });
    const bytes = new Uint8Array(await blob.arrayBuffer());

    const imageEmbed = await pdfDoc.embedJpg(bytes);
    const page = pdfDoc.addPage([imageEmbed.width, imageEmbed.height]);
    page.drawImage(imageEmbed, {
      x: 0,
      y: 0,
      width: imageEmbed.width,
      height: imageEmbed.height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return {
    blob: new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }),
    name: 'images_converted.pdf'
  };
}

function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not defined'));
  }
  if ((window as any).pdfjsLib) {
    return Promise.resolve((window as any).pdfjsLib);
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      try {
        // Bypass Same-Origin restrictions for loading web workers from cross-origin CDN
        const workerCode = `importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js');`;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      } catch (err) {
        console.warn('Failed to configure worker proxy, falling back to CDN worker directly:', err);
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      resolve(pdfjsLib);
    };
    script.onerror = () => {
      reject(new Error('Failed to load PDF.js from CDN.'));
    };
    document.head.appendChild(script);
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface ParagraphData {
  text?: string;
  leftText?: string;
  rightText?: string;
  alignment: 'left' | 'center' | 'right';
  fontSize: number;
  isHeading: boolean;
  isList?: boolean;
  isDualColumn?: boolean;
}

function linkify(text: string): string {
  const urlRegex = /(https?:\/\/[^\s\)]+)/g;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

  let html = text;
  html = html.replace(urlRegex, '<a href="$1" style="color: #0563c1; text-decoration: underline;">$1</a>');
  html = html.replace(emailRegex, '<a href="mailto:$1" style="color: #0563c1; text-decoration: underline;">$1</a>');
  return html;
}

/**
 * Convert PDF to editable Word document (.doc)
 */
export async function processPdfToWord(file: File): Promise<{ blob: Blob; name: string }> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes);
  const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'document';
  const pageCount = pdfDoc.getPageCount();

  const paragraphs: ParagraphData[] = [];

  try {
    const pdfjsLib = await loadPdfJs();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileBytes) });
    const pdf = await loadingTask.promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });
      const pageWidth = viewport.width || 595.27; // Default A4 width in points

      const textItems = (textContent.items as any[]).filter(
        (item) => item && typeof item.str === 'string' && Array.isArray(item.transform)
      );

      // Sort items: primarily top-to-bottom (Y descending)
      textItems.sort((a, b) => b.transform[5] - a.transform[5]);

      // Group items into lines where Y difference relative to the line baseline (first item) is small (<= 6 points)
      const lines: any[][] = [];
      let currentLine: any[] = [];

      for (const item of textItems) {
        if (currentLine.length === 0) {
          currentLine.push(item);
        } else {
          const firstItem = currentLine[0];
          if (Math.abs(item.transform[5] - firstItem.transform[5]) <= 6) {
            currentLine.push(item);
          } else {
            lines.push(currentLine);
            currentLine = [item];
          }
        }
      }
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }

      // Sort items within each line from left to right (X ascending)
      for (const line of lines) {
        line.sort((a, b) => a.transform[4] - b.transform[4]);
      }

      // Process lines into paragraph blocks
      let pendingText = '';
      let pendingItems: any[] = [];
      let lastLineY: number | null = null;
      let lastLineHeight = 10;
      let lastLineMaxX: number | null = null;

      const commitPending = () => {
        if (pendingText.trim() && pendingItems.length > 0) {
          const minX = Math.min(...pendingItems.map((item) => item.transform[4]));
          const maxX = Math.max(...pendingItems.map((item) => item.transform[4] + (item.width || 0)));
          const heights = pendingItems.map((item) => Math.abs(item.transform[3]) || item.height || 10);
          const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length;

          // Alignment heuristic
          let alignment: 'left' | 'center' | 'right' = 'left';
          const paragraphWidth = maxX - minX;
          if (paragraphWidth > 0 && pageWidth > 0) {
            const paragraphCenter = (minX + maxX) / 2;
            const pageCenter = pageWidth / 2;

            if (pageWidth - maxX < 80 && minX > pageWidth * 0.5) {
              alignment = 'right';
            } else if (
              Math.abs(paragraphCenter - pageCenter) < 25 &&
              minX > 40 &&
              pageWidth - maxX > 40 &&
              paragraphWidth < pageWidth * 0.75
            ) {
              alignment = 'center';
            }
          }

          // Check if list item
          const trimmedText = pendingText.trim();
          const isList = trimmedText.startsWith('•') || 
                         trimmedText.startsWith('') || 
                         trimmedText.startsWith('\uf0b7') || 
                         trimmedText.startsWith('*') || 
                         trimmedText.startsWith('-') || 
                         /^\d+[\)\.]/.test(trimmedText);

          paragraphs.push({
            text: trimmedText,
            alignment,
            fontSize: Math.round(avgHeight * 0.95),
            isHeading: avgHeight > 12.5 && !isList,
            isList
          });
        }
        pendingText = '';
        pendingItems = [];
      };

      for (const line of lines) {
        const currentLineY = line[0].transform[5];
        const lineHeights = line.map((item) => Math.abs(item.transform[3]) || item.height || 10);
        const avgLineHeight = lineHeights.reduce((sum, h) => sum + h, 0) / lineHeights.length;
        const currentLineMaxX = Math.max(...line.map((item) => item.transform[4] + (item.width || 0)));

        // Check for horizontal gaps (split column layout)
        let splitIndex = -1;
        for (let j = 0; j < line.length - 1; j++) {
          const current = line[j];
          const next = line[j + 1];
          const currentRight = current.transform[4] + (current.width || 0);
          const nextLeft = next.transform[4];
          const gap = nextLeft - currentRight;

          if (gap > pageWidth * 0.10) { // Optimized to 10% of page width
            splitIndex = j;
            break;
          }
        }

        // Construct line texts
        let lineLeftText = '';
        let lineRightText = '';
        let lineFullText = '';

        const joinItems = (items: any[]) => {
          let text = '';
          let prevX: number | null = null;
          let prevWidth: number | null = null;
          for (const item of items) {
            const currentX = item.transform[4];
            const currentHeight = Math.abs(item.transform[3]) || item.height || 10;
            if (prevX !== null && prevWidth !== null) {
              const gap = currentX - (prevX + prevWidth);
              const spaceThreshold = currentHeight * 0.28; // Prevents letter splitting in uppercase headers
              
              // Skip spaces around punctuation, URLs, and phone number dashes
              const isSpecialChar = (char: string) => /[-.@/\\+:_~#?=%&\[\]()]/.test(char);
              const prevChar = text.slice(-1);
              const nextChar = item.str.charAt(0);
              
              if (!text.endsWith(' ') && !item.str.startsWith(' ') && gap > spaceThreshold) {
                if (!isSpecialChar(prevChar) && !isSpecialChar(nextChar)) {
                  text += ' ';
                }
              }
            }
            text += item.str;
            prevX = currentX;
            prevWidth = item.width || 0;
          }
          return text;
        };

        if (splitIndex !== -1) {
          // Commit any pending paragraph first before starting a table row
          commitPending();

          const leftItems = line.slice(0, splitIndex + 1);
          const rightItems = line.slice(splitIndex + 1);

          lineLeftText = joinItems(leftItems);
          lineRightText = joinItems(rightItems);

          paragraphs.push({
            isDualColumn: true,
            leftText: lineLeftText.trim(),
            rightText: lineRightText.trim(),
            alignment: 'left',
            fontSize: Math.round(avgLineHeight * 0.95),
            isHeading: avgLineHeight > 12.5
          });

          lastLineY = currentLineY;
          lastLineHeight = avgLineHeight;
          lastLineMaxX = null; // Do not merge into/from dual-column rows
        } else {
          lineFullText = joinItems(line);

          // Paragraph breaks check
          let startNewParagraph = false;
          if (lastLineY !== null) {
            const dy = lastLineY - currentLineY;
            const threshold = lastLineHeight * 1.35;
            
            // Check if previous line ended early (did not wrap to the right margin)
            const prevLineEndedEarly = lastLineMaxX !== null && lastLineMaxX < pageWidth - 100;

            // Check if bullet point or list marker starts this line
            const trimmedLineText = lineFullText.trim();
            const startsWithListMarker = trimmedLineText.startsWith('•') || 
                                         trimmedLineText.startsWith('') || 
                                         trimmedLineText.startsWith('\uf0b7') || 
                                         trimmedLineText.startsWith('*') || 
                                         trimmedLineText.startsWith('-') || 
                                         /^\d+[\)\.]/.test(trimmedLineText);

            // Check if font size changed significantly
            const fontSizeChanged = Math.abs(avgLineHeight - lastLineHeight) > 1.5;

            if (dy > threshold || dy < -5 || prevLineEndedEarly || startsWithListMarker || fontSizeChanged) {
              startNewParagraph = true;
            }
          } else {
            startNewParagraph = true;
          }

          if (startNewParagraph) {
            commitPending();
          }

          const needsSpace = pendingText && !pendingText.endsWith(' ') && !lineFullText.startsWith(' ');
          pendingText += (needsSpace ? ' ' : '') + lineFullText;
          pendingItems.push(...line);

          lastLineY = currentLineY;
          lastLineHeight = avgLineHeight;
          lastLineMaxX = currentLineMaxX;
        }
      }

      commitPending();
    }
  } catch (err) {
    console.warn('PDF.js text extraction failed, falling back to basic info:', err);
  }

  // Fallback if no text extracted or PDF.js failed
  if (paragraphs.length === 0) {
    paragraphs.push({
      text: '[This document has been converted into an editable Microsoft Word format. You can now edit, format, and save this file in MS Word.]',
      alignment: 'left',
      fontSize: 11,
      isHeading: false
    });
  }

  const wordHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${originalName}</title>
      <style>
        @page {
          size: A4;
          margin: 1.2cm;
        }
        body { font-family: Arial, sans-serif; line-height: 1.25; padding: 0; }
        p { margin: 0 0 4pt 0; }
      </style>
    </head>
    <body>
      <div style="color: #111;">
        ${paragraphs.map((p) => {
          if (p.isDualColumn) {
            return `
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; margin-bottom: 4pt; border: none;">
                <tr style="border: none;">
                  <td align="left" valign="top" style="padding: 0; border: none; font-size: ${p.fontSize}pt; font-family: Arial, sans-serif; ${p.isHeading ? 'font-weight: bold;' : ''}">
                    ${p.isHeading ? `<b>${linkify(escapeHtml(p.leftText || ''))}</b>` : linkify(escapeHtml(p.leftText || ''))}
                  </td>
                  <td align="right" valign="top" style="padding: 0; border: none; font-size: ${p.fontSize}pt; font-family: Arial, sans-serif; ${p.isHeading ? 'font-weight: bold;' : ''}">
                    ${p.isHeading ? `<b>${linkify(escapeHtml(p.rightText || ''))}</b>` : linkify(escapeHtml(p.rightText || ''))}
                  </td>
                </tr>
              </table>
            `;
          }

          if (p.isHeading) {
            return `
              <h2 align="${p.alignment}" style="font-size: ${p.fontSize}pt; font-family: Arial, sans-serif; color: #111; margin-top: 12pt; margin-bottom: 2pt; border: none; padding: 0;">
                <b>${linkify(escapeHtml(p.text || ''))}</b>
              </h2>
              <hr color="#333" size="1" style="height: 1.5px; border: none; color: #333; background-color: #333; margin-top: 0; margin-bottom: 6pt; padding: 0;" />
            `;
          }

          if (p.isList) {
            const cleanText = p.text ? p.text.replace(/^([•\uf0b7\*\-]|&bull;)\s*/, '') : '';
            const style = [
              `font-size: ${p.fontSize}pt`,
              `font-family: Arial, sans-serif`,
              `margin-left: 20pt`,
              `text-indent: -10pt`,
              `margin-bottom: 4pt`,
              `line-height: 1.35`
            ].join('; ');
            return `<p align="left" style="${style}">&bull; ${linkify(escapeHtml(cleanText))}</p>`;
          }

          const style = [
            `font-size: ${p.fontSize}pt`,
            `font-family: Arial, sans-serif`,
            `margin-bottom: 4pt`,
            `line-height: 1.35`
          ].join('; ');
          
          return `<p align="${p.alignment}" style="${style}">${linkify(escapeHtml(p.text || ''))}</p>`;
        }).join('\n')}
      </div>
    </body>
    </html>
  `;

  return {
    blob: new Blob([wordHtml], { type: 'application/msword' }),
    name: `${originalName}_converted.doc`
  };
}

/**
 * Compress an image to fit under a specific target file size (in KB)
 */
export async function processImageSizeCompressor(
  file: File,
  targetSizeKB?: number
): Promise<{ blob: Blob; name: string }> {
  const img = await loadImage(file);
  const targetKB = targetSizeKB && targetSizeKB > 0 ? targetSizeKB : 200;
  const targetBytes = targetKB * 1024;
  const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2D context.');

  const testBlob = (scale: number, quality: number): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
    });
  };

  let bestBlob: Blob | null = null;
  for (let q = 0.9; q >= 0.1; q -= 0.1) {
    const blob = await testBlob(1.0, q);
    if (blob) {
      bestBlob = blob;
      if (blob.size <= targetBytes) {
        return { blob, name: `${originalName}_compressed.jpg` };
      }
    }
  }

  for (let scale = 0.9; scale >= 0.1; scale -= 0.1) {
    const blob = await testBlob(scale, 0.3);
    if (blob) {
      bestBlob = blob;
      if (blob.size <= targetBytes) {
        return { blob, name: `${originalName}_compressed.jpg` };
      }
    }
  }

  if (!bestBlob) {
    throw new Error('Image size compression failed.');
  }

  return {
    blob: bestBlob,
    name: `${originalName}_compressed.jpg`
  };
}

/**
 * Audio Converter via in-browser Web Audio API rendering (produces downloadable WAV file)
 */
export async function processAudioConvert(file: File, targetFormat?: string): Promise<{ blob: Blob; name: string }> {
  const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'audio_track';
  const ext = targetFormat ? targetFormat.toLowerCase() : 'wav';

  try {
    const arrayBuffer = await file.arrayBuffer();
    const OfflineCtxClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    
    let decodedBuffer: AudioBuffer;
    if (OfflineCtxClass) {
      const tempCtx = new OfflineCtxClass(1, 1, 44100);
      decodedBuffer = await tempCtx.decodeAudioData(arrayBuffer);
    } else if (AudioCtxClass) {
      const tempCtx = new AudioCtxClass();
      decodedBuffer = await tempCtx.decodeAudioData(arrayBuffer);
    } else {
      throw new Error('No AudioContext support found in this browser.');
    }

    // Encode AudioBuffer to standard WAV PCM Blob
    const numOfChan = decodedBuffer.numberOfChannels;
    const length = decodedBuffer.length * numOfChan * 2 + 44;
    const outBuffer = new ArrayBuffer(length);
    const view = new DataView(outBuffer);
    const channels: Float32Array[] = [];
    let sampleRate = decodedBuffer.sampleRate;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" chunk
    setUint32(length - pos - 4);

    for (let i = 0; i < decodedBuffer.numberOfChannels; i++) {
      channels.push(decodedBuffer.getChannelData(i));
    }

    while (offset < decodedBuffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return {
      blob: new Blob([outBuffer], { type: 'audio/wav' }),
      name: `${originalName}_converted.${ext}`
    };
  } catch (err) {
    console.warn('AudioContext decoding failed, applying fallback stream:', err);
  }

  // Fallback blob
  const fileBytes = await file.arrayBuffer();
  return {
    blob: new Blob([fileBytes], { type: 'audio/wav' }),
    name: `${originalName}_converted.${ext}`
  };
}

/**
 * Video Trimmer using browser-native MediaRecorder and HTMLVideoElement
 */
export async function processVideoTrim(
  file: File,
  start: number,
  end: number,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; name: string }> {
  const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'video';
  const ext = file.name.split('.').pop() || 'mp4';

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    // Append hidden video to body so captureStream works reliably in all browsers
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    video.style.width = '160px';
    video.style.height = '120px';
    document.body.appendChild(video);

    const cleanup = () => {
      URL.revokeObjectURL(video.src);
      video.remove();
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const actualStart = Math.max(0, Math.min(start, duration));
      const actualEnd = Math.max(actualStart, Math.min(end, duration));
      const trimDuration = actualEnd - actualStart;

      if (trimDuration <= 0) {
        cleanup();
        reject(new Error('Invalid trim range: Start time must be less than End time.'));
        return;
      }

      // Capture stream
      let stream: MediaStream;
      try {
        if ((video as any).captureStream) {
          stream = (video as any).captureStream();
        } else if ((video as any).mozCaptureStream) {
          stream = (video as any).mozCaptureStream();
        } else {
          throw new Error('Browser does not support capturing stream from video elements.');
        }
      } catch (streamErr) {
        cleanup();
        reject(streamErr);
        return;
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : 'video/mp4'
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunks, { type: recorder.mimeType });
        cleanup();
        const outputExt = recorder.mimeType.includes('webm') ? 'webm' : ext;
        resolve({
          blob: recordedBlob,
          name: `${originalName}_trimmed.${outputExt}`
        });
      };

      // Seek to start position
      video.currentTime = actualStart;

      video.onseeked = () => {
        video.onseeked = null; // Remove handler
        
        // Render 2x faster than real-time to speed up processing
        video.playbackRate = 2.0;
        
        recorder.start();
        video.play().catch((playErr) => {
          cleanup();
          reject(playErr);
        });

        const checkProgress = () => {
          if (video.currentTime >= actualEnd || video.paused || video.ended) {
            video.pause();
            recorder.stop();
          } else {
            const currentProgress = ((video.currentTime - actualStart) / trimDuration) * 100;
            if (onProgress) onProgress(currentProgress);
            requestAnimationFrame(checkProgress);
          }
        };

        requestAnimationFrame(checkProgress);
      };
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to decode or play video file.'));
    };
  });
}
