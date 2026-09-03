import {
  RateLimiter,
  RateLimitResult
} from "../interfaces/rate-limiter.js";

import {
  redisClient
} from "../redis/client.js";

import {
  slidingWindowLogScript
} from "../redis/scripts.ts";

export class SlidingWindowLogLimiter implements RateLimiter {
  private readonly limit: number;
  private readonly windowSeconds: number;

  constructor(limit: number, windowSeconds: number) {
    this.limit = limit;
    this.windowSeconds = windowSeconds;
  }

  async allow(key: string): Promise<RateLimitResult> {
    const timestampKey = `rate:log:${key}`;
    const sequenceKey = `rate:log:seq:${key}`;

    const now = Math.floor(Date.now() / 1000);

    const result = await redisClient.eval(
      slidingWindowLogScript,
      {
        keys: [
          timestampKey,
          sequenceKey
        ],
        arguments: [
          now.toString(),
          this.windowSeconds.toString(),
          this.limit.toString()
        ]
      }
    );

    const [
      allowed,
      count,
      retryAfter,
      resetAt
    ] = result as [
      number,
      number,
      number,
      number
    ];

    if (allowed === 0) {
      return {
        allowed: false,
        limit: this.limit,
        remaining: 0,
        retryAfter,
        resetAt
      };
    }

    return {
      allowed: true,
      limit: this.limit,
      remaining: this.limit - count,
      resetAt
    };
  }
}