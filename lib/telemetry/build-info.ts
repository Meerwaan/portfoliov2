export type BuildInfo = {
  sha7: string;
  isLocal: boolean;
  buildTime: string;
  commitDate: string;
  /** "2026.09" style deploy stamp derived from the commit date. */
  deployStamp: string;
};

function stamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "LOCAL";
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function getBuildInfo(): BuildInfo {
  const sha7 = process.env.NEXT_PUBLIC_COMMIT_SHA ?? "LOCAL";
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date(0).toISOString();
  const commitDate = process.env.NEXT_PUBLIC_COMMIT_DATE ?? buildTime;
  return {
    sha7,
    isLocal: sha7 === "LOCAL",
    buildTime,
    commitDate,
    deployStamp: stamp(commitDate),
  };
}
