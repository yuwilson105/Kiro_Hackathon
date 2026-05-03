import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import feedRouter from './routes/feed';
import healthRouter from './routes/health';
import jobsRouter from './routes/jobs';
import planRouter from './routes/plan';
import resourcesRouter from './routes/resources';

const app = express();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// CORS — restrict origin in production via ALLOWED_ORIGIN env var
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN ?? '*',
    methods: ['GET', 'POST'],
  }),
);

// JSON body parsing with 64 KB size limit (Requirement 6.6)
app.use(express.json({ limit: '64kb' }));

// Request logger — logs 4xx/5xx responses (before routes)
app.use(requestLogger);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.use('/health', healthRouter);
app.use('/plan/generate', planRouter);
app.use('/jobs/recommend', jobsRouter);
app.use('/feed/generate', feedRouter);
app.use('/resources/find', resourcesRouter);

// ---------------------------------------------------------------------------
// Error handler (registered last)
// ---------------------------------------------------------------------------

app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

const PORT = parseInt(process.env.PORT ?? '3000', 10);

app.listen(PORT, () => {
  console.log(`SecondChance backend listening on port ${PORT}`);
});

export default app;
