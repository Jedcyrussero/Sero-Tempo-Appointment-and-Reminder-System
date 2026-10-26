export function getAppBaseUrl(requestUrl?: string) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  if (requestUrl) {
    return new URL(requestUrl).origin;
  }

  return 'http://localhost:3000';
}
