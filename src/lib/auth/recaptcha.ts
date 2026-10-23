/** Server-only reCAPTCHA v2 verification against Google's siteverify endpoint. */
export async function verifyRecaptcha(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error("RECAPTCHA_SECRET_KEY is not set — refusing to skip verification.");
    return false;
  }

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error("reCAPTCHA verification request failed:", err);
    return false;
  }
}
