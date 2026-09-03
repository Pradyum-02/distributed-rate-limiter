import express from "express";

import {
  connectRedis,
  redisClient
} from "./redis/client.js";

import {
  FixedWindowLimiter
} from "./algorithms/fixed-window.js";

import {
  rateLimit
} from "./middleware/rate-limit.js";

async function main() {
  await connectRedis();

  const app = express();

  const limiter = new FixedWindowLimiter(5, 60);

  app.get(
    "/api/test",
    rateLimit(limiter),
    (req, res) => {
      res.json({
        message: "Request successful"
      });
    }
  );

  const PORT = 3000;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  process.on("SIGINT", async () => {
    await redisClient.quit();
    process.exit(0);
  });
}

main();