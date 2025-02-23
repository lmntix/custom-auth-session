import { headers } from "next/headers";

export async function getIp() {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  if (forwardedFor) {
    // x-forwarded-for may contain multiple IPs, we take the first one
    return forwardedFor.split(",")[0].trim();
  } else if (realIp) {
    return realIp;
  }

  return "Unknown";
}
