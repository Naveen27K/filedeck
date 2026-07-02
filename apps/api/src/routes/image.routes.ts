import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload.middleware';
import { z } from 'zod';

const router = Router();

const resizeSchema = z.object({
  width: z.string(),
  height: z.string(),
  maintainAspectRatio: z.string().optional()
});

const compressSchema = z.object({
  quality: z.string()
});

const convertSchema = z.object({
  format: z.string()
});

// POST /api/v1/image/resize
router.post('/resize', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, data: null, error: 'Please upload an image file.' });
      return;
    }
    const { width, height } = resizeSchema.parse(req.body);

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

// POST /api/v1/image/compress
router.post('/compress', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, data: null, error: 'Please upload an image file.' });
      return;
    }
    const { quality } = compressSchema.parse(req.body);

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

// POST /api/v1/image/convert
router.post('/convert', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, data: null, error: 'Please upload an image file.' });
      return;
    }
    const { format } = convertSchema.parse(req.body);

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

// POST /api/v1/image/remove-bg
router.post('/remove-bg', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, data: null, error: 'Please upload an image file.' });
      return;
    }

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
