import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const router = Router();

const qrSchema = z.object({
  text: z.string(),
  size: z.number().optional().default(256),
  color: z.string().optional().default('#000000')
});

const passwordSchema = z.object({
  length: z.number().default(16),
  uppercase: z.boolean().default(true),
  lowercase: z.boolean().default(true),
  numbers: z.boolean().default(true),
  symbols: z.boolean().default(true)
});

// POST /api/v1/utilities/qr
router.post('/qr', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, size, color } = qrSchema.parse(req.body);

    res.json({
      success: true,
      data: {
        imageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${color.replace('#', '')}`
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/utilities/password-generator
router.post('/password-generator', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { length, uppercase, lowercase, numbers, symbols } = passwordSchema.parse(req.body);
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const num = '0123456789';
    const sym = '!@#$%^&*()_+~`|}{[]:;?><,./-+=';

    let pool = '';
    if (uppercase) pool += upper;
    if (lowercase) pool += lower;
    if (numbers) pool += num;
    if (symbols) pool += sym;

    let password = '';
    if (pool) {
      for (let i = 0; i < length; i++) {
        password += pool[Math.floor(Math.random() * pool.length)];
      }
    }

    res.json({
      success: true,
      data: { password },
      error: null
    });
  } catch (err) {
    next(err);
  }
});

export default router;
