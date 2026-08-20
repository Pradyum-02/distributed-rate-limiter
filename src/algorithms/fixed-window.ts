import { RateLimiter, RateLimitResult } from "../interfaces/rate-limiter.js";
// This describes what we need to remember
interface WindowState{
    count: number;
    windowStart: number;
}

export class FixedWindowLimiter implements RateLimiter{
    private readonly limit: number;
    private readonly windowMs: number;
    private readonly windows = new Map<string, WindowState>();

    constructor(limit: number, windowsMs: number){
        this.limit = limit;
        this.windowMs = windowsMs;
    }
    async allow(key: string): Promise<RateLimitResult> {
  const now = Date.now();

  const currentWindow = this.windows.get(key);

  if (!currentWindow) {
    this.windows.set(key, {
      count: 1,
      windowStart: now
    });

    return {
      allowed: true,
      remaining: this.limit - 1
    };
  }

  const elapsed = now - currentWindow.windowStart;

  if (elapsed >= this.windowMs) {
    this.windows.set(key, {
      count: 1,
      windowStart: now
    });

    return {
      allowed: true,
      remaining: this.limit - 1
    };
  }

  if (currentWindow.count >= this.limit) {
    const retryAfter = Math.ceil(
      (this.windowMs - elapsed) / 1000
    );

    return {
      allowed: false,
      remaining: 0,
      retryAfter
    };
  }

  currentWindow.count++;

  return {
    allowed: true,
    remaining: this.limit - currentWindow.count
  };
}
}

// Request
//    ↓
// Get current time
//    ↓
// Find user's window
//    ↓
// Does window exist?
//    │
//    ├── NO → Create window
//    │
//    └── YES
//           ↓
//       Has window expired?
//        /          \
//      YES           NO
//       ↓             ↓
//    Reset       Check count
//                   /    \
//                limit   < limit
//                  ↓       ↓
//                BLOCK   INCREMENT