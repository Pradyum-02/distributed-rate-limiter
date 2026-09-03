import { Request, Response, NextFunction } from "express";
import { RateLimiter } from "../interfaces/rate-limiter.js";

export function rateLimit(
  limiter: RateLimiter,
  limit: number
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const key = `ip:${req.ip}`;

      const result = await limiter.allow(key);

      res.setHeader(
        "X-RateLimit-Limit",
        limit
      );

      res.setHeader(
        "X-RateLimit-Remaining",
        result.remaining
      );

      if (result.resetAt !== undefined) {
        res.setHeader(
          "X-RateLimit-Reset",
          result.resetAt
        );
      }

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
    } catch (error) {
      console.error("Rate limiter error:", error);

      return res.status(500).json({
        error: "Rate limiter unavailable"
      });
    }
  };
}