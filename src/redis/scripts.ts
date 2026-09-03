import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const fixedWindowScript = readFileSync(
  path.join(__dirname, "scripts", "fixed-window.lua"),
  "utf-8"
);