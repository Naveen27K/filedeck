import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload.middleware';
import { z } from 'zod';

const router = Router();

const cutSchema = z.object({
  start: z.string(),
  end: z.string()
});

const convertSchema = z.object({
  format: z.string()
});

// POST /api/v1/audio/cut
router.post('/cut', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, data: null, error: 'Please upload an audio file.' });
      return;
    }
    const { start, end } = cutSchema.parse(req.body);

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

// POST /api/v1/audio/convert
router.post('/convert', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, data: null, error: 'Please upload an audio file.' });
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

export default router;
