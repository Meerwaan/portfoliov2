import { z } from "zod";

export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email().max(200),
  message: z.string().min(20).max(4000),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot must stay empty
  locale: z.enum(["fr", "en"]).default("fr"),
});

const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 8;
const hits = new Map<string, number[]>();

function limited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > LIMIT;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";
  if (!apiKey || !to) return Response.json({ error: "form_disabled" }, { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  const { email, message, locale } = parsed.data;

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `[mwn-tech.com] ${locale.toUpperCase()} · ${email}`,
    text: `${message}\n\n---\nfrom: ${email}\nip: ${ip}\nlocale: ${locale}`,
  });
  if (error) return Response.json({ error: "send_failed" }, { status: 502 });
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
