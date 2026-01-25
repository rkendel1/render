import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// 10 requests per minute (sliding window)
export const minuteRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "ratelimit:minute",
});

// 100 requests per day (fixed window)
export const dailyRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(100, "1 d"),
  prefix: "ratelimit:daily",
});
