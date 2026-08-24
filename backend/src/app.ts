import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

// ─────────────────────────────────────────────
// Rate Limiters
// ─────────────────────────────────────────────

/** Global limiter: 200 requests per 15 minutes per IP */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests. Please slow down.', code: 'RATE_LIMITED' } }
});

/** Auth limiter: 10 attempts per 15 minutes per IP — protects against brute-force */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many authentication attempts. Please wait 15 minutes.', code: 'AUTH_RATE_LIMITED' } }
});

export const createApp = () => {
  const app = express();

  // ─── Security Headers (helmet) ───────────────────────────────────────
  // Sets X-Content-Type-Options, X-Frame-Options (clickjacking), HSTS,
  // X-XSS-Protection, and removes X-Powered-By fingerprint header.
  app.use(helmet());

  // ─── CORS ─────────────────────────────────────────────────────────────
  // SECURITY FIX: Restrict to known client origin only.
  // Previously was `origin: '*'` which allows any site to make credentialed
  // cross-origin requests (CSRF-like data exfiltration).
  app.use(cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // ─── Body Parsing with Size Limits ───────────────────────────────────
  // SECURITY FIX: Without a limit, oversized JSON bodies can crash/DoS the server.
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // ─── Global Rate Limiter ──────────────────────────────────────────────
  app.use(globalLimiter);

  // ─── Health Check (no auth, no rate limit burden) ─────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      platform: 'ProductForge API',
      timestamp: new Date().toISOString()
    });
  });

  // ─── Auth Routes with Strict Rate Limiting ───────────────────────────
  // Apply tight brute-force limiter before the router handles login/register.
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // ─── API Router ───────────────────────────────────────────────────────
  app.use('/api', apiRouter);

  // ─── Global Error Handler ─────────────────────────────────────────────
  app.use(errorHandler);

  return app;
};
