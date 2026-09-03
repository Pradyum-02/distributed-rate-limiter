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

    const result = await redisClient.eval(
      `
      local current = redis.call("INCR", KEYS[1])

      if current == 1 then
          redis.call("EXPIRE", KEYS[1], ARGV[1])
      end

      local ttl = redis.call("TTL", KEYS[1])

      return { current, ttl }
      `,
      {
        keys: [redisKey],
        arguments: [this.windowSeconds.toString()]
      }
    );

    const [count, ttl] = result as [number, number];

    if (count > this.limit) {
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