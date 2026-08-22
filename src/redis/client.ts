import { createClient } from "redis";

// creates our Node.js Redis client
const redisClient = createClient({
  url: "redis://localhost:6379"
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

export async function connectRedis(): Promise<void> {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export { redisClient };