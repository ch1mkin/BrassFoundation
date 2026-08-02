/** Prevent open redirects after auth / login. */
export function safeNextPath(next: string | null | undefined, fallback = "/member") {
  if (!next) return fallback;
  const value = next.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  // Block protocol-relative and scheme-ish paths
  if (/^\/\\/.test(value) || /^\/[a-z]+:/i.test(value)) {
    return fallback;
  }
  return value;
}
