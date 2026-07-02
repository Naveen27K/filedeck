import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load envs
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Standard base route
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: { status: 'healthy', version: '1.0.0' },
    error: null
  });
});

// Category Route Placeholders
import pdfRouter from './routes/pdf.routes';
import imageRouter from './routes/image.routes';
import documentRouter from './routes/document.routes';
import audioRouter from './routes/audio.routes';
import videoRouter from './routes/video.routes';
import utilitiesRouter from './routes/utilities.routes';
import resumeRouter from './routes/resume.routes';

app.use('/api/v1/pdf', pdfRouter);
app.use('/api/v1/image', imageRouter);
app.use('/api/v1/document', documentRouter);
app.use('/api/v1/audio', audioRouter);
app.use('/api/v1/video', videoRouter);
app.use('/api/v1/utilities', utilitiesRouter);
app.use('/api/v1/resume', resumeRouter);

// Global 404 Route
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    data: null,
    error: `Endpoint ${req.method} ${req.path} not found.`
  });
});

// Global Error Handler Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    data: null,
    error: err.message || 'An internal server error occurred.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[FileDeck API] Server is running on http://localhost:${PORT}`);
});
