export function getPublicUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.toString();
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return "https://" + process.env.NEXT_PUBLIC_VERCEL_URL.toString();
  }

  return "URL_ERROR";
}
