// unit-test-agent.js — AI-powered Unit Test Generator (Google Gemini free tier)
// ──────────────────────────────────────────────────────────────────────────────
// SETUP:
//   npm install @google/genai
//   Get free key → https://aistudio.google.com/apikey
//
// RUN:
//   GEMINI_API_KEY="your-key" node .agent/unit-test-agent.js src/api.ts
// ─────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";

// ─── CONFIG ──────────────────────────────────────────────────
const MODEL = "gemini-2.5-flash-lite";   // best free-tier availability
const MAX_STEPS = 15;
const RETRY_WAIT_SEC = 10;               // wait between retries on 429/503

// ─── TOOLS THE AI CAN USE ────────────────────────────────────
const toolDeclarations = [
  {
    name: "read_file",
    description: "Read a source file and return its contents",
    parameters: {
      type: "OBJECT",
      properties: {
        filepath: { type: "STRING", description: "Path to read" },
      },
      required: ["filepath"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a file (creates dirs if needed)",
    parameters: {
      type: "OBJECT",
      properties: {
        filepath: { type: "STRING", description: "Path to write" },
        content: { type: "STRING", description: "File content" },
      },
      required: ["filepath", "content"],
    },
  },
  {
    name: "run_tests",
    description: "Run vitest on a test file, returns output",
    parameters: {
      type: "OBJECT",
      properties: {
        filepath: { type: "STRING", description: "Test file path" },
      },
      required: ["filepath"],
    },
  },
];

// ─── TOOL LOGIC ──────────────────────────────────────────────
function runTool(name, args) {
  console.log(`  🔧 ${name}(${args.filepath || ""})`);

  switch (name) {
    case "read_file":
      try { return fs.readFileSync(args.filepath, "utf8"); }
      catch (e) { return `ERROR: ${e.message}`; }

    case "write_file":
      try {
        fs.mkdirSync(path.dirname(args.filepath), { recursive: true });
        fs.writeFileSync(args.filepath, args.content, "utf8");
        return `✅ Written ${args.filepath}`;
      } catch (e) { return `ERROR: ${e.message}`; }

    case "run_tests":
      try {
        return execSync(`npx vitest run "${args.filepath}" --reporter=verbose 2>&1`, {
          encoding: "utf8", timeout: 60_000,
        });
      } catch (e) { return e.stdout || e.message; }

    default:
      return `Unknown tool: ${name}`;
  }
}

// ─── GEMINI CALL WITH RETRY ─────────────────────────────────
async function callGemini(ai, contents, config) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      return await ai.models.generateContent({ model: MODEL, contents, config });
    } catch (err) {
      if ((err.status === 503 || err.status === 429) && attempt < 5) {
        const wait = RETRY_WAIT_SEC * attempt;
        console.log(`  ⏳ ${err.status} — waiting ${wait}s before retry ${attempt}/5...`);
        await new Promise(r => setTimeout(r, wait * 1000));
      } else {
        throw err;
      }
    }
  }
}

// ─── MAIN AGENT LOOP ─────────────────────────────────────────
async function main() {
  const targetFile = process.argv[2];
  if (!targetFile || !fs.existsSync(targetFile)) {
    console.log("Usage: GEMINI_API_KEY=... node .agent/unit-test-agent.js <file>");
    console.log("  e.g: node .agent/unit-test-agent.js src/api.ts");
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("❌ Set GEMINI_API_KEY first (free key from https://aistudio.google.com/apikey)");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const isComponent = targetFile.endsWith(".tsx");
  const ext = isComponent ? "tsx" : "ts";
  const testPath = `src/__tests__/${path.basename(targetFile, path.extname(targetFile))}.test.${ext}`;

  console.log(`\n🧪 Unit Test Agent (${MODEL})`);
  console.log(`📁 ${targetFile} → ${testPath}\n`);

  const config = { tools: [{ functionDeclarations: toolDeclarations }] };
  const contents = [{
    role: "user",
    parts: [{ text: `You are a unit test engineer. Write Vitest tests for "${targetFile}".

Steps:
1. read_file to read the source
2. write_file to create tests at "${testPath}"
   - import { describe, it, expect, vi } from 'vitest'
   ${isComponent ? "- Use @testing-library/react for components" : "- Test pure logic directly"}
   - Cover normal, edge, and error cases
   - Mock external deps with vi.mock()
3. run_tests to execute them
4. If tests fail, fix them with write_file and run_tests again

When done, print a summary of what passed/failed.` }],
  }];

  for (let step = 1; step <= MAX_STEPS; step++) {
    process.stdout.write(`\n📍 Step ${step}/${MAX_STEPS}`);
    const response = await callGemini(ai, contents, config);

    const calls = response.functionCalls;
    if (!calls || calls.length === 0) {
      // Model is done — print final text
      console.log("\n\n" + "═".repeat(50));
      console.log(response.text || "✅ Done");
      console.log("═".repeat(50));
      break;
    }

    // Add model response to conversation
    contents.push(response.candidates[0].content);

    // Execute tools and send results back
    const parts = calls.map(fc => ({
      functionResponse: {
        name: fc.name,
        response: { result: runTool(fc.name, fc.args) },
        id: fc.id,
      },
    }));
    contents.push({ role: "user", parts });
  }
}

main().catch(err => {
  console.error("\n❌", err.message || err);
  process.exit(1);
});