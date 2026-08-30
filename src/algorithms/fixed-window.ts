// this is fixed window algorithm


import {
  RateLimiter,
  RateLimitResult
} from "../interfaces/rate-limiter.js";

import {
  redisClient
} from "../redis/client.js";

export class FixedWindowLimiter implements RateLimiter {
  private readonly limit: number;
  private readonly windowSeconds: number;

  constructor(limit: number, windowSeconds: number) {
    this.limit = limit;
    this.windowSeconds = windowSeconds;
  }

  async allow(key: string): Promise<RateLimitResult> {
    const redisKey = `rate:${key}`;

    const count = await redisClient.incr(redisKey);

    if (count === 1) {
      await redisClient.expire(
        redisKey,
        this.windowSeconds
      );
    }

    if (count > this.limit) {
      const ttl = await redisClient.ttl(redisKey);

      return {
        allowed: false,
        remaining: 0,
        retryAfter: ttl
      };
    }

    return {
      allowed: true,
      remaining: this.limit - count
    };
  }
}