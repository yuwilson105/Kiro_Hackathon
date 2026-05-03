import type { NextFunction, Request, Response } from 'express';

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      console.error(
        JSON.stringify({
          path: req.path,
          status: res.statusCode,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  });
  next();
}
