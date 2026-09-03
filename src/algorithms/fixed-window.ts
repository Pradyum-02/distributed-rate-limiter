import {
  RateLimiter,
  RateLimitResult
} from "../interfaces/rate-limiter.js";

import {
  redisClient
} from "../redis/client.js";

import {
  fixedWindowScript
} from "../redis/scripts.ts";

export class FixedWindowLimiter implements RateLimiter {
  private readonly limit: number;
  private readonly windowSeconds: number;

  constructor(limit: number, windowSeconds: number) {
    this.limit = limit;
    this.windowSeconds = windowSeconds;
  }

  async allow(key: string): Promise<RateLimitResult> {
    const redisKey = `rate:${key}`;

    const result = await redisClient.eval(
      fixedWindowScript,
      {
        keys: [redisKey],
        arguments: [this.windowSeconds.toString()]
      }
    );

    const [count, ttl] = result as [number, number];

    const resetAt =
      Math.floor(Date.now() / 1000) + ttl;

    if (count > this.limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfter: ttl,
        resetAt
      };
    }

    return {
      allowed: true,
      remaining: this.limit - count,
      resetAt
    };
  }
}