import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Capture the original res.json method
  const originalJson = res.json.bind(res);

  // Override res.json to log response
  res.json = function (data: unknown) {
    const duration = Date.now() - startTime;
    const status = res.statusCode;

    logger.info(`${req.method} ${req.path} - ${status} (${duration}ms)`);

    return originalJson(data);
  };

  next();
};
