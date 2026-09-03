import { connectRedis, redisClient } from "./redis/client.js";
import { SlidingWindowLogLimiter } from "./algorithms/sliding-window-log.js";

async function main() {
  await connectRedis();

  const limiter = new SlidingWindowLogLimiter(5, 60);

  const key = "inspect-test";

  await redisClient.del(`rate:log:${key}`);
  await redisClient.del(`rate:log:seq:${key}`);

  for (let i = 1; i <= 5; i++) {
    console.log(
      `Request ${i}:`,
      await limiter.allow(key)
    );
  }

  await redisClient.quit();
}

main();