import { RateLimiterMemory } from "rate-limiter-flexible";
import { getIp } from "./get-ip";

const rateLimiter = new RateLimiterMemory({
  points: 3, // Number of points
  duration: 30, // Per 60 seconds
});

export async function rateLimit(key: string) {
  const ip = await getIp();
  if (!ip) {
    throw new Error("Could not get IP address");
  }
  const identifier = `${ip}_${key}`;
  try {
    await rateLimiter.consume(identifier);
  } catch (error) {
    throw new Error("Too many requests. Try again later.");
  }
}
