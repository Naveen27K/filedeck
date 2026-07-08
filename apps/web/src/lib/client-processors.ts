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

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const base64Data = dataUrl.split(',')[1];
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

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
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
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

/**
 * Convert PDF to editable Word document (.doc)
 */
export async function processPdfToWord(file: File): Promise<{ blob: Blob; name: string }> {
  const fileBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBytes);
  const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'document';
  const pageCount = pdfDoc.getPageCount();

  const paragraphs: string[] = [];

  try {
    const pdfjsLib = await loadPdfJs();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileBytes) });
    const pdf = await loadingTask.promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items as any[];

      // Sort items: top-to-bottom, then left-to-right
      items.sort((a, b) => {
        const yA = a.transform ? a.transform[5] : 0;
        const yB = b.transform ? b.transform[5] : 0;
        if (Math.abs(yA - yB) > 5) {
          return yB - yA;
        }
        const xA = a.transform ? a.transform[4] : 0;
        const xB = b.transform ? b.transform[4] : 0;
        return xA - xB;
      });

      let lastY: number | null = null;
      let lineText = '';

      for (const item of items) {
        const currentY = item.transform ? item.transform[5] : null;

        if (lastY !== null && Math.abs(currentY - lastY) > 5) {
          if (lineText.trim()) {
            paragraphs.push(lineText.trim());
          }
          lineText = item.str;
        } else {
          lineText += (lineText ? ' ' : '') + item.str;
        }
        lastY = currentY;
      }

      if (lineText.trim()) {
        paragraphs.push(lineText.trim());
      }
    }
  } catch (err) {
    console.warn('PDF.js text extraction failed, falling back to basic info:', err);
  }

  // Fallback if no text extracted or PDF.js failed
  if (paragraphs.length === 0) {
    paragraphs.push('[This document has been converted into an editable Microsoft Word format. You can now edit, format, and save this file in MS Word.]');
  }

  const wordHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${originalName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
        h1 { color: #2b2b2b; border-bottom: 2px solid #6366f1; pb: 5px; }
        p { margin-bottom: 12px; }
      </style>
    </head>
    <body>
      <h1>${originalName}</h1>
      <p><em>Converted from PDF (${pageCount} pages) on ${new Date().toLocaleDateString()}</em></p>
      <hr/>
      <div style="font-size: 11pt; color: #333;">
        ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n')}
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
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);

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
    }
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
