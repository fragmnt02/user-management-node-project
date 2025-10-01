import { NextFunction, Request, Response } from "express";

interface HttpError extends Error {
  status?: number;
}

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  const err = new Error("Not Found") as HttpError;
  err.status = 404;
  next(err);
}
  
export function errorHandler(err: HttpError, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    error: { message, status },
  });
}
  