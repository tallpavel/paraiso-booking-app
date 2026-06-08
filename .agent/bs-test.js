import { chromium } from "playwright-core";

const caps = {
  browser: "chrome",
  browser_version: "latest",
  os: "Windows",
  os_version: "11",
  "browserstack.username": process.env.BROWSERSTACK_USERNAME,
  "browserstack.accessKey": process.env.BROWSERSTACK_ACCESS_KEY,
  "browserstack.local": "false",
  "browserstack.playwrightVersion": "1.latest",
  name: "Quick Test",
};

const ws = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;

async function test() {
  console.log("🔌 Connecting to BrowserStack...");
  console.log("   Playwright version: 1.59.1");
  console.log("   WebSocket URL length:", ws.length);

  const browser = await chromium.connect({ wsEndpoint: ws, timeout: 30000 });
  console.log("✅ Connected! Browser:", browser.version());

  const context = await browser.newContext();
  const page = await context.newPage();
  console.log("📄 Navigating...");

  await page.goto("https://example.com", { timeout: 20000 });
  console.log("📋 Title:", await page.title());

  await browser.close();
  console.log("✅ Done!");
}

test().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
