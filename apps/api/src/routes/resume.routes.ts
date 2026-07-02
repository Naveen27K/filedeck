import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const router = Router();

const draftSchema = z.object({
  templateId: z.string(),
  content: z.any()
});

// POST /api/v1/resume/draft
router.post('/draft', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { templateId, content } = draftSchema.parse(req.body);
    const draftId = `draft-${Date.now()}`;

    res.json({
      success: true,
      data: {
        draftId,
        message: 'Draft saved successfully.'
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/resume/draft/:id
router.get('/draft/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      data: {
        id,
        templateId: 'modern',
        content: {
          personalInfo: { fullName: 'Jane Doe', email: 'jane.doe@example.com' },
          experience: [],
          education: [],
          skills: [],
          projects: []
        }
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
});

export default router;
