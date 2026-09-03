// Capture public pages of live products at 1440x900 @2x. Usage: node scripts/dev/capture-live.mjs <url> <outfile> [fullPage=0]
import { chromium } from "playwright";
const [, , url, out, full = "0"] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: "light", locale: "fr-FR" });
await page.goto(url, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(2500);
// dismiss common cookie banners if any
for (const sel of ['button:has-text("Accepter")', 'button:has-text("Accept")', 'button:has-text("OK")']) {
  const b = page.locator(sel).first();
  if (await b.count()) { try { await b.click({ timeout: 1000 }); } catch {} }
}
const links = await page.evaluate(() => Array.from(new Set(Array.from(document.querySelectorAll("a[href]")).map(a => a.href).filter(h => h.startsWith(location.origin)))));
console.log("links:", links.join("\n  "));
console.log("title:", await page.title());
await page.screenshot({ path: out, fullPage: full === "1" });
await browser.close();
console.log("saved", out);
