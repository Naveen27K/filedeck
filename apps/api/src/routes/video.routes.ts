import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload.middleware';
import { z } from 'zod';

const router = Router();

const trimSchema = z.object({
  start: z.string(),
  end: z.string()
});

const compressSchema = z.object({
  quality: z.string()
});

// POST /api/v1/video/trim
router.post('/trim', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, data: null, error: 'Please upload a video file.' });
      return;
    }
    const { start, end } = trimSchema.parse(req.body);

    res.json({
      success: true,
      data: {
        jobId: `job-${Date.now()}`,
        status: 'processing'
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/video/compress
router.post('/compress', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, data: null, error: 'Please upload a video file.' });
      return;
    }
    const { quality } = compressSchema.parse(req.body);

    res.json({
      success: true,
      data: {
        jobId: `job-${Date.now()}`,
        status: 'processing'
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
});

export default router;
