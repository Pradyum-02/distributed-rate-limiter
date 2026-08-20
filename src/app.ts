import { FixedWindowLimiter } from "./algorithms/fixed-window.js";

async function main() {
  const limiter = new FixedWindowLimiter(5, 60_000);

  for (let i = 1; i <= 7; i++) {
    const result = await limiter.allow("user:123");

    console.log(`Request ${i}:`, result);
  }
}

main();