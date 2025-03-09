import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`);
  
  // PostgreSQL unique violation error
  if (err.code === '23505') {
    return res.status(400).json({
      success: false,
      error: 'Duplicate value entered. This record already exists.',
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'Referenced record does not exist.',
    });
  }

  // Set status code
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    
    Error.captureStackTrace(this, this.constructor);
  }
}