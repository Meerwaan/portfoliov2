import { chromium } from "playwright";
const [,, url, out, w = "1440", h = "900", scheme = "light", full = "0"] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, colorScheme: scheme });
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(1500);
await page.screenshot({ path: out, fullPage: full === "1" });
await browser.close();
console.log("saved", out);
