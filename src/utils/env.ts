import fs from "fs";
import path from "path";

export function loadEnv() {
  if (
    typeof process === "undefined" ||
    typeof process.cwd !== "function" ||
    typeof fs === "undefined" ||
    !fs.existsSync ||
    typeof path === "undefined" ||
    !path.resolve
  ) {
    return;
  }
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    try {
      if (typeof (process as any).loadEnvFile === "function") {
        (process as any).loadEnvFile(envPath);
      } else {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const [key, ...rest] = trimmed.split("=");
            const val = rest.join("=").trim().replace(/^["']|["']$/g, "");
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = val;
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }
}
