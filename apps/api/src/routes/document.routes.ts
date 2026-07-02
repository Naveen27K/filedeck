import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// POST /api/v1/document/convert
router.post('/convert', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, data: null, error: 'Please upload a document file.' });
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
