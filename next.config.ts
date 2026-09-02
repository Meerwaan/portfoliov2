import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

function git(command: string, fallback: string): string {
  try {
    return execSync(command, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || fallback;
  } catch {
    return fallback;
  }
}

const buildTime = new Date().toISOString();
const fullSha = process.env.VERCEL_GIT_COMMIT_SHA ?? git("git rev-parse HEAD", "");
const commitSha = fullSha ? fullSha.slice(0, 7) : "LOCAL";
const commitDate = git("git log -1 --format=%cI", buildTime);

const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitSha,
    NEXT_PUBLIC_COMMIT_DATE: commitDate,
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1200, 1600, 2400],
    qualities: [70, 82],
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/logo192.png", destination: "/icon.svg", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/screens/:path*", headers: immutable }];
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const withAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

export default withAnalyzer(withNextIntl(nextConfig));
