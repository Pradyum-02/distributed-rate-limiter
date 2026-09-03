import { Request, Response, NextFunction } from "express";
import { RateLimiter } from "../interfaces/rate-limiter.js";

export function rateLimit(limiter: RateLimiter) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const key = `ip:${req.ip}`;

    const result = await limiter.allow(key);

    res.setHeader(
      "X-RateLimit-Remaining",
      result.remaining
    );

    if (!result.allowed) {
      if (result.retryAfter !== undefined) {
        res.setHeader(
          "Retry-After",
          result.retryAfter
        );
      }

      return res.status(429).json({
        error: "Too many requests"
      });
    }

    next();
  };
}