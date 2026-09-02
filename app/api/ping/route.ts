export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { region: process.env.VERCEL_REGION ?? "local", at: Date.now() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
