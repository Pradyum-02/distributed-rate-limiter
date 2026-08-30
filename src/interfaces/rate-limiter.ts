// Whenever a rate limiter makes a decision, this is the structure of the result
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

export interface RateLimiter {
//Any algorithm we create later must provide an allow() method. 
  allow(key: string): Promise<RateLimitResult>; 
}