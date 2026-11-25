// The content of a check-in QR code. One code per approved application
// (project_applications.checkin_code); the /checkin/{code} route that a
// coordinator's scanner opens is built in Part 3.

/** Absolute URL encoded in the QR code: {NEXT_PUBLIC_APP_URL}/checkin/{checkin_code}. */
export function checkinUrl(code: string) {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  return `${base}/checkin/${encodeURIComponent(code)}`;
}
