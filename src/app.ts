// this app.ts is designed to use for sliding window protocol

import { connectRedis, redisClient } from "./redis/client.js";
import { FixedWindowLimiter } from "./algorithms/fixed-window.js";

async function main() {
  await connectRedis();

  const limiter = new FixedWindowLimiter(5, 60);

  const key = "user:123";

  for (let i = 1; i <= 7; i++) {
    const result = await limiter.allow(key);

    console.log(`Request ${i}:`, result);
  }

  await redisClient.quit();
}

main();