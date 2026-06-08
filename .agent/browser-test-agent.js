// browser-test-agent.js — Cross-Browser Testing Agent (BrowserStack + Gemini)
// ─────────────────────────────────────────────────────────────────────────────
// SETUP:
//   npm install playwright-core @google/genai browserstack-local
//
// RUN (deployed site):
//   BROWSERSTACK_USERNAME="user" BROWSERSTACK_ACCESS_KEY="key" \
//   GEMINI_API_KEY="key" node .agent/browser-test-agent.js https://your-site.com
//
// RUN (local dev server):
//   BROWSERSTACK_USERNAME="user" BROWSERSTACK_ACCESS_KEY="key" \
//   GEMINI_API_KEY="key" node .agent/browser-test-agent.js http://localhost:5173
// ─────────────────────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { chromium, firefox, webkit } from "playwright-core";
import { GoogleGenAI } from "@google/genai";
import BrowserStackLocal from "browserstack-local";

// Catch silent crashes
process.on("unhandledRejection", (err) => { console.error("\n💥 Unhandled:", err); process.exit(1); });
process.on("uncaughtException", (err) => { console.error("\n💥 Uncaught:", err); process.exit(1); });

// ─── CONFIG ──────────────────────────────────────────────────
const MODEL = "gemini-2.5-flash-lite";
const RETRY_WAIT_SEC = 10;
const SCREENSHOT_DIR = ".agent/screenshots";

// ─── BROWSER/DEVICE MATRIX ──────────────────────────────────
const DEVICES = [
  {
    key: "chrome-win",
    name: "Chrome / Windows 11",
    engine: chromium,
    caps: { browser: "chrome", browser_version: "latest", os: "Windows", os_version: "11" },
  },
  {
    key: "safari-mac",
    name: "Safari / macOS",
    engine: webkit,
    caps: { browser: "playwright-webkit", browser_version: "latest", os: "osx", os_version: "Sonoma" },
  },
  {
    key: "firefox-win",
    name: "Firefox / Windows 11",
    engine: firefox,
    caps: { browser: "playwright-firefox", browser_version: "latest", os: "Windows", os_version: "11" },
  },
  {
    key: "iphone-15",
    name: "iPhone 15 (Safari)",
    engine: webkit,
    caps: { browser: "playwright-webkit", browser_version: "latest", os: "osx", os_version: "Sonoma" },
    viewport: { width: 393, height: 852 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  },
  {
    key: "android-galaxy",
    name: "Galaxy S24 (Chrome)",
    engine: chromium,
    caps: { browser: "chrome", browser_version: "latest", os: "Windows", os_version: "11" },
    viewport: { width: 360, height: 780 },
    userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  },
];

// ─── BROWSERSTACK LOCAL TUNNEL ───────────────────────────────
function startTunnel(accessKey) {
  return new Promise((resolve, reject) => {
    const tunnel = new BrowserStackLocal.Local();
    tunnel.start({ key: accessKey, force: true }, (err) => {
      if (err) reject(new Error(`Tunnel failed: ${err.message}`));
      else {
        console.log("  🔗 BrowserStack Local tunnel is UP");
        resolve(tunnel);
      }
    });
  });
}

function stopTunnel(tunnel) {
  return new Promise((resolve) => {
    if (tunnel?.isRunning()) tunnel.stop(resolve);
    else resolve();
  });
}

// ─── TEST A SINGLE BROWSER/DEVICE ────────────────────────────
async function testDevice(url, device, isLocal) {
  const username = process.env.BROWSERSTACK_USERNAME;
  const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;

  const caps = {
    ...device.caps,
    "browserstack.username": username,
    "browserstack.accessKey": accessKey,
    "browserstack.local": isLocal ? "true" : "false",
    project: "Paraiso Booking App",
    build: `Test ${new Date().toISOString().split("T")[0]}`,
    name: device.name,
  };

  const wsUrl = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;
  console.log(`  🌐 ${device.name}...`);
  console.log(`     Connecting via WebSocket...`);

  let browser;
  try {
    browser = await device.engine.connect({ wsEndpoint: wsUrl, timeout: 60000 });

    const contextOpts = {
      httpCredentials: { username: "admin", password: "Paraiso2026!" },
    };
    if (device.viewport) contextOpts.viewport = device.viewport;
    if (device.userAgent) contextOpts.userAgent = device.userAgent;

    const context = await browser.newContext(contextOpts);
    const page = await context.newPage();

    // Collect errors
    const errors = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });

    // Screenshot
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    const screenshotPath = path.join(SCREENSHOT_DIR, `${device.key}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const title = await page.title();
    const viewport = page.viewportSize();

    await context.close();
    return {
      device: device.name,
      status: "✅ OK",
      title,
      viewport: `${viewport.width}x${viewport.height}`,
      screenshot: screenshotPath,
      errors: errors.length > 0 ? errors.slice(0, 5) : ["None"],
    };
  } catch (err) {
    console.error(`     ❌ Error: ${err.message}`);
    return {
      device: device.name,
      status: `❌ ${err.message.slice(0, 120)}`,
      errors: [],
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

// ─── GEMINI CALL WITH RETRY ─────────────────────────────────
async function callGemini(ai, prompt) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      return response.text;
    } catch (err) {
      if ((err.status === 503 || err.status === 429) && attempt < 5) {
        const wait = RETRY_WAIT_SEC * attempt;
        console.log(`  ⏳ Gemini ${err.status} — waiting ${wait}s...`);
        await new Promise((r) => setTimeout(r, wait * 1000));
      } else {
        throw err;
      }
    }
  }
}

// ─── MAIN ────────────────────────────────────────────────────
async function main() {
  const url = process.argv[2];
  if (!url || !url.startsWith("http")) {
    console.log("Usage: node .agent/browser-test-agent.js <url>");
    console.log("  e.g: node .agent/browser-test-agent.js http://localhost:5173");
    process.exit(1);
  }

  const missing = ["BROWSERSTACK_USERNAME", "BROWSERSTACK_ACCESS_KEY", "GEMINI_API_KEY"]
    .filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`❌ Missing env vars: ${missing.join(", ")}`);
    process.exit(1);
  }

  const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  console.log(`\n🌍 Browser Test Agent`);
  console.log(`🔗 ${url}${isLocal ? " (local — tunnel enabled)" : ""}`);
  console.log(`📱 Testing ${DEVICES.length} devices\n`);

  // Start tunnel for local URLs
  let tunnel = null;
  if (isLocal) {
    console.log("  🚇 Starting BrowserStack Local tunnel...");
    tunnel = await startTunnel(process.env.BROWSERSTACK_ACCESS_KEY);
  }

  try {
    // Run tests
    const results = [];
    for (const device of DEVICES) {
      const result = await testDevice(url, device, isLocal);
      results.push(result);
      const extra = result.viewport ? ` (${result.viewport})` : "";
      console.log(`     ${result.status}${extra}`);
      if (result.errors?.[0] !== "None" && result.errors?.length > 0) {
        result.errors.forEach((e) => console.log(`     ⚠️  ${e.slice(0, 80)}`));
      }
    }

    // Gemini analysis
    console.log(`\n🧠 Analyzing results with AI...\n`);

    const prompt = `You are a QA engineer reviewing cross-browser test results for a booking app at ${url}.

Results from ${DEVICES.length} browsers/devices:

${JSON.stringify(results, null, 2)}

Provide a concise report:
1. Overall status — did the site load on all browsers?
2. Browser-specific errors or failures
3. Mobile vs desktop issues
4. Actionable recommendations

Use emoji. Keep it brief.`;

    const analysis = await callGemini(ai, prompt);

    console.log("═".repeat(50));
    console.log("📋 CROSS-BROWSER TEST REPORT");
    console.log("═".repeat(50));
    console.log(analysis);
    console.log("═".repeat(50));

    const passed = results.filter((r) => r.status.startsWith("✅")).length;
    const failed = results.length - passed;
    console.log(`\n✅ ${passed} passed  ❌ ${failed} failed  📸 Screenshots → ${SCREENSHOT_DIR}/\n`);
  } finally {
    if (tunnel) {
      console.log("  🚇 Closing tunnel...");
      await stopTunnel(tunnel);
    }
  }
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message || err);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
