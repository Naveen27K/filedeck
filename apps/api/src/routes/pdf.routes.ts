import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload.middleware';
import { z } from 'zod';

const router = Router();

// Zod schemas for query/body validation
const splitSchema = z.object({
  ranges: z.string().min(1)
});

const rotateSchema = z.object({
  angle: z.string()
});

const protectSchema = z.object({
  password: z.string().min(1)
});

const watermarkSchema = z.object({
  text: z.string().default('CONFIDENTIAL'),
  fontSize: z.string().default('50'),
  opacity: z.string().default('0.3')
});

// POST /api/v1/pdf/merge
router.post('/merge', upload.array('files'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length < 2) {
      res.status(400).json({ success: false, data: null, error: 'Please upload at least 2 PDF files to merge.' });
      return;
    }

    // Processing simulation (placeholder for pdf-lib / backend runner)
    res.json({
      success: true,
      data: {
        downloadUrl: `/api/v1/download/${files[0].filename}`,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/pdf/split
router.post('/split', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, data: null, error: 'Please upload a PDF file.' });
      return;
    }
    const { ranges } = splitSchema.parse(req.body);

    res.json({
      success: true,
      data: {
        downloadUrl: `/api/v1/download/${req.file.filename}`,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/pdf/rotate
router.post('/rotate', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, data: null, error: 'Please upload a PDF file.' });
      return;
    }
    const { angle } = rotateSchema.parse(req.body);

    res.json({
      success: true,
      data: {
        downloadUrl: `/api/v1/download/${req.file.filename}`,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/pdf/protect
router.post('/protect', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, data: null, error: 'Please upload a PDF file.' });
      return;
    }
    const { password } = protectSchema.parse(req.body);

    res.json({
      success: true,
      data: {
        downloadUrl: `/api/v1/download/${req.file.filename}`,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/pdf/watermark
router.post('/watermark', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, data: null, error: 'Please upload a PDF file.' });
      return;
    }
    const { text, fontSize, opacity } = watermarkSchema.parse(req.body);

    res.json({
      success: true,
      data: {
        downloadUrl: `/api/v1/download/${req.file.filename}`,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
});

export default router;
