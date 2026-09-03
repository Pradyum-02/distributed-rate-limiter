import { connectRedis, redisClient } from "./redis/client.js";
import { FixedWindowLimiter } from "./algorithms/fixed-window.js";

async function main() {
  await connectRedis();

  const limiter = new FixedWindowLimiter(5, 60);

  const key = "concurrent-user";

  await redisClient.del(`rate:${key}`);

  const requests = Array.from(
    { length: 20 },
    () => limiter.allow(key)
  );

  const results = await Promise.all(requests);

  results.forEach((result, index) => {
    console.log(`Request ${index + 1}:`, result);
  });

  const allowed = results.filter(
    result => result.allowed
  ).length;

  const blocked = results.filter(
    result => !result.allowed
  ).length;

  console.log("\nSummary:");
  console.log("Allowed:", allowed);
  console.log("Blocked:", blocked);

  await redisClient.quit();
}

main();