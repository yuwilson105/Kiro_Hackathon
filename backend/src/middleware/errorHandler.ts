import type { NextFunction, Request, Response } from 'express';
import type { ErrorResponse } from '../types/api';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status: number = err.status ?? 500;
  const body: ErrorResponse = {
    error: err.message ?? 'Internal server error',
    code: err.code ?? 'INTERNAL_ERROR',
    ...(err.retryAfter ? { retryAfter: err.retryAfter } : {}),
  };

  // Log path, status, timestamp — no Profile field values
  console.error(
    JSON.stringify({ path: req.path, status, timestamp: new Date().toISOString() }),
  );

  res.status(status).json(body);
}
