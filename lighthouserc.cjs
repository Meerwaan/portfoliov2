/** Lighthouse CI: run against `pnpm start` (production build). `pnpm lhci` locally, or the CI workflow. */
const base = process.env.LHCI_BASE_URL || "http://localhost:3000";
const paths = ["/fr", "/en", "/fr/work", "/en/work", "/fr/work/reputap", "/en/work/reputap", "/fr/lab", "/en/lab", "/fr/about", "/en/about", "/fr/contact", "/en/contact"];

module.exports = {
  ci: {
    collect: {
      url: paths.map((p) => base + p),
      numberOfRuns: 1,
      settings: { preset: "desktop", chromeFlags: "--no-sandbox --headless=new" },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "total-blocking-time": ["warn", { maxNumericValue: 150 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
      },
    },
    upload: { target: "temporary-public-storage" },
  },
};
