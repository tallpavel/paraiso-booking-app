import { chromium } from "playwright-core";
import { GoogleGenAI } from "@google/genai";
import BrowserStackLocal from "browserstack-local";

// ─── CONFIGURATION ─────────────────────────────────────────────────────────────
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash"; // Fallback to 2.5-flash if none provided
const MAX_STEPS = 15; // To prevent infinite loops in the agent

// ─── EXTRACT SIMPLIFIED UI FOR GEMINI ──────────────────────────────────────
async function getInteractiveUI(page) {
  // Inject a script to flag all interactive elements with a unique `ai-id`
  // and extract a text-based representation of the UI for the LLM.
  return await page.evaluate(() => {
    let idCounter = 1;
    let uiSummary = [];
    
    // Select all potentially interactive elements
    const elements = document.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"]'
    );
    
    elements.forEach(el => {
      // Basic visibility check
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return;
      
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      // Assign the ID so we can locate it from Playwright later
      el.setAttribute("ai-id", idCounter.toString());
      
      // Gather helpful description texts
      const tagName = el.tagName.toLowerCase();
      let textContent = el.innerText?.trim();
      if (!textContent && el.placeholder) textContent = `Hint: "${el.placeholder}"`;
      if (!textContent && el.value) textContent = `Value: "${el.value}"`;
      if (!textContent && el.ariaLabel) textContent = `Aria: "${el.ariaLabel}"`;
      if (!textContent) textContent = "No text";
      
      // Clean up newlines 
      textContent = textContent.replace(/\s+/g, ' ').substring(0, 50);

      uiSummary.push(`[ID: ${idCounter}] <${tagName}> - ${textContent}`);
      idCounter++;
    });

    return uiSummary.join("\n");
  });
}

// ─── TUNNEL SETUP ──────────────────────────────────────────────────────────────
function startTunnel(accessKey) {
  return new Promise((resolve, reject) => {
    const tunnel = new BrowserStackLocal.Local();
    tunnel.start({ key: accessKey, force: true }, (err) => {
      if (err) reject(new Error(`Tunnel failed: ${err.message}`));
      else resolve(tunnel);
    });
  });
}

// ─── MAIN ORCHESTRATOR ─────────────────────────────────────────────────────────
async function main() {
  const url = process.argv[2];
  const task = process.argv.slice(3).join(" ");
  
  if (!url || !task) {
    console.log("Usage: node .agent/ai-web-agent.js <url> <objective>");
    console.log("Example: node .agent/ai-web-agent.js http://localhost:5173 \"Book a 2-night stay for tomorrow\"");
    process.exit(1);
  }

  const username = process.env.BROWSERSTACK_USERNAME;
  const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!username || !accessKey || !geminiKey) {
    console.error("❌ Missing required env vars: BROWSERSTACK_USERNAME, BROWSERSTACK_ACCESS_KEY, GEMINI_API_KEY");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey });
  const isLocal = url.includes("localhost") || url.includes("127.0.0.1");

  console.log(`\n🤖 Starting Autonomous Web Agent`);
  console.log(`🎯 Objective: ${task}`);
  console.log(`🔗 Target URL: ${url}`);

  let tunnel = null;
  let browser = null;

  try {
    if (isLocal) {
      console.log("  🚇 Starting BrowserStack local tunnel...");
      tunnel = await startTunnel(accessKey);
    }

    console.log("  🌐 Connecting to BrowserStack Browser...");
    const caps = {
      browser: "chrome",
      browser_version: "latest",
      os: "Windows",
      os_version: "11",
      "browserstack.username": username,
      "browserstack.accessKey": accessKey,
      "browserstack.local": isLocal ? "true" : "false",
      "browserstack.playwrightVersion": "1.latest",
      name: "Autonomous AI Test",
    };
    
    // We connect using Playwright CDP
    const wsUrl = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;
    browser = await chromium.connect({ 
      wsEndpoint: wsUrl, 
      timeout: 45000 
    });

    const context = await browser.newContext({
      httpCredentials: { username: "admin", password: "Paraiso2026!" }
    });
    const page = await context.newPage();

    console.log("  📄 Loading page...");
    await page.goto(url, { waitUntil: "networkidle" });
    
    // Define the Gemini Tools
    const tools = [{
      functionDeclarations: [
        {
          name: "click_element",
          description: "Click an interactive element on the page using its AI ID.",
          parameters: {
            type: "OBJECT",
            properties: { id: { type: "INTEGER", description: "The ID number of the element" } },
            required: ["id"]
          }
        },
        {
          name: "type_text",
          description: "Type text into an input field using its AI ID.",
          parameters: {
            type: "OBJECT",
            properties: { 
              id: { type: "INTEGER", description: "The ID number of the element" },
              text: { type: "STRING", description: "The text to type" }
            },
            required: ["id", "text"]
          }
        },
        {
          name: "test_completed",
          description: "Call this when the objective is completely fulfilled, or if it is impossible to proceed.",
          parameters: {
            type: "OBJECT",
            properties: {
              success: { type: "BOOLEAN", description: "Did you successfully complete the objective?" },
              summary: { type: "STRING", description: "A detailed summary of what happened." }
            },
            required: ["success", "summary"]
          }
        }
      ]
    }];

    // We keep track of the entire conversation history context manually
    let chatHistory = [];

    // The system prompt sets the rules
    const systemPrompt = `You are a strict, autonomous QA web tester. 
Your objective is: "${task}".
Rules:
1. Examine the list of interactive elements provided to you.
2. Formulate a plan, and execute *one step at a time* using the available functions (click_element, type_text).
3. If the objective is complete, or if you are stuck, call test_completed.
4. When you call a tool, wait for the environment to respond with the new updated UI state.
5. CRITICAL: You MUST use a function call to interact. Give your reasoning, but you MUST end your response by invoking a tool. DO NOT just reply with text.`;
    
    // Removed unsupported system role push
    
    let isDone = false;
    let stepCount = 0;

    // AI Loop
    while (!isDone && stepCount < MAX_STEPS) {
      stepCount++;
      console.log(`\n⏳ [Step ${stepCount}] Analyzing UI...`);
      
      // Give the page a moment to settle animations/network
      await page.waitForTimeout(1000); 
      
      const currentUi = await getInteractiveUI(page);
      const promptText = `Current URL: ${page.url()}\nInteractive Elements Available:\n${currentUi}\n\nWhat is your next action?`;
      
      chatHistory.push({ role: "user", parts: [{ text: promptText }] });

      // Call Gemini API with a retry loop for 503s
      let response;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: MODEL,
            systemInstruction: systemPrompt,
            contents: chatHistory,
            tools: tools,
            toolConfig: { functionCallingConfig: { mode: "ANY" } } // Force a function call
          });
          break; // Success
        } catch (error) {
          if (error.message && error.message.includes("503") && retries > 1) {
            console.log(`  ⏳ High demand detected (503). Retrying in 3 seconds...`);
            await new Promise(r => setTimeout(r, 3000));
            retries--;
          } else {
            throw error;
          }
        }
      }

      // The response might contain text (thought process) AND/OR function calls
      if (response.text?.trim()) {
        console.log(`  🧠 AI Thought: ${response.text.trim().replace(/\n/g, ' ')}`);
      }

      // Extract the function call from either top-level property or deep within candidates
      const functionCall = response.functionCalls?.[0] || response.candidates?.[0]?.content?.parts?.find(p => p.functionCall)?.functionCall;
      
      // Save Gemini's response to history
      chatHistory.push(response.candidates[0].content);

      if (functionCall) {
        const name = functionCall.name;
        const args = functionCall.args;
        
        console.log(`  🛠️  Action Executed: ${name}(${JSON.stringify(args)})`);
        
        // Execute the action in Playwright
        try {
          if (name === "click_element") {
            const selector = `[ai-id="${args.id}"]`;
            await page.locator(selector).click({ timeout: 5000 });
            chatHistory.push({ 
              role: "function", 
              parts: [{ functionResponse: { name, response: { status: "success" } } }] 
            });
          } 
          else if (name === "type_text") {
            const selector = `[ai-id="${args.id}"]`;
            await page.locator(selector).fill(args.text, { timeout: 5000 });
            chatHistory.push({ 
              role: "function", 
              parts: [{ functionResponse: { name, response: { status: "success" } } }] 
            });
          }
          else if (name === "test_completed") {
            console.log("\n══════════════════════════════════════════════════");
            console.log(`🏁 TEST FINISHED [${args.success ? "✅ SUCCESS" : "❌ FAILED"}]`);
            console.log(`📝 SUMMARY: \n${args.summary}`);
            console.log("══════════════════════════════════════════════════");
            isDone = true;
          }
        } catch (err) {
          console.error(`     ⚠️ Failed to execute ${name}: ${err.message}`);
          chatHistory.push({ 
            role: "function", 
            parts: [{ functionResponse: { name, response: { status: "error", message: err.message } } }] 
          });
        }
      } else {
        // No function call means Gemini didn't know what to do, or forgot
        console.log("  ⚠️ AI did not invoke a tool. Pausing for 3s to avoid rate limits, then prompting it again.");
        await new Promise(r => setTimeout(r, 3000));
        
        chatHistory.push({ 
          role: "user", 
          parts: [{ text: "SYSTEM ERROR: You responded with conversation text. You MUST invoke a tool (like click_element) to proceed." }] 
        });
      }
    }

    if (stepCount >= MAX_STEPS) {
      console.log("\n❌ Halted: Exceeded maximum allowed steps.");
    }

  } catch (err) {
    console.error("\n💥 Fatal Error:", err.message);
  } finally {
    if (browser) await browser.close().catch(()=>{});
    if (tunnel) {
      console.log("\n🚇 Closing tunnel...");
      await stopTunnel(tunnel).catch(()=>{});
    }
  }
}

function stopTunnel(tunnel) {
  return new Promise((resolve) => {
    if (tunnel?.isRunning()) tunnel.stop(resolve);
    else resolve();
  });
}

main();
