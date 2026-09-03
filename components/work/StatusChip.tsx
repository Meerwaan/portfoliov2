import { getTranslations } from "next-intl/server";
import { LiveDot } from "@/components/system/LiveDot";
import type { Status } from "@/lib/content/schema";

/** Mono status chip. The live dot appears only for systems actually in production. */
export async function StatusChip({ status }: { status: Status }) {
  const t = await getTranslations("work.status");
  return (
    <span className="mono-label inline-flex items-center gap-2 text-ink-2">
      {status === "production" && <LiveDot state="live" />}
      <span className={status === "production" ? "text-signal" : undefined}>{t(status)}</span>
    </span>
  );
}
