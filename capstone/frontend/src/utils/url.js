export function normalizeUrl(raw) {
  if (!raw) return '';
  // If it already has a protocol, leave it alone
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  // Otherwise, assume HTTPS
  return `https://${raw}`;
}
