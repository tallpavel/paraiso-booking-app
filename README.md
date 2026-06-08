# Paraíso Booking App

A luxury booking application built with React, TypeScript, and Vite.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Vanilla CSS with editorial magazine-style design
- **Testing:** Vitest + Testing Library
- **Deployment:** AWS EC2 + Nginx

## Getting Started

```bash
npm install
npm run dev
```

## 🧪 Unit Test Agent

An AI-powered agent that automatically writes and runs **unit tests** for any file in the project. It uses Google Gemini's free tier to read your source code, generate Vitest tests, run them, and self-heal any failures.

### Setup (one-time)

```bash
# 1. Install dependencies (already included in package.json)
npm install @google/genai
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom

# 2. Get a free API key at https://aistudio.google.com/apikey
```

### Usage

```bash
# Test any file — just pass the path
GEMINI_API_KEY="your-key" node .agent/unit-test-agent.js src/api.ts
GEMINI_API_KEY="your-key" node .agent/unit-test-agent.js src/components/BookingCalendar.tsx
GEMINI_API_KEY="your-key" node .agent/unit-test-agent.js src/hooks/useBooking.ts
```

### How it works

1. 📖 **Reads** the source file
2. ✍️ **Writes** Vitest unit tests to `src/__tests__/`
3. ▶️ **Runs** the tests
4. 🔄 **Self-heals** — if tests fail, it fixes and retries automatically
5. 📋 **Reports** a summary of what passed/failed

> Uses `gemini-2.5-flash-lite` for best free-tier availability with built-in retry logic for rate limits.

## 🌍 Browser Test Agent

An AI-powered agent that tests your site across **real browsers and devices** via [BrowserStack](https://www.browserstack.com). It opens your site on each device, takes screenshots, captures JS errors, then uses Gemini to analyze the results.

### Setup (one-time)

```bash
# 1. Install dependencies (requires specific Playwright version for BS compatibility)
npm install playwright-core@1.44.0 @google/genai browserstack-local

# 2. Get credentials
#    BrowserStack → https://www.browserstack.com/accounts/settings
#    Gemini (free) → https://aistudio.google.com/apikey
```

### Usage

You can test either a live URL or a local development server. The agent will automatically detect `localhost` URLs and establish a secure BrowserStack tunnel for you.

```bash
# Test a live production site
BROWSERSTACK_USERNAME="pavellarsen_BqsiAr" \
BROWSERSTACK_ACCESS_KEY="CxkyRHgLDz63yq6pseto" \
GEMINI_API_KEY="gemini-key" \
node .agent/browser-test-agent.js https://your-site.com

# Test local development server (automatically starts a tunnel)
BROWSERSTACK_USERNAME="pavellarsen_BqsiAr" \
BROWSERSTACK_ACCESS_KEY="CxkyRHgLDz63yq6pseto" \
GEMINI_API_KEY="gemini-key" \
node .agent/browser-test-agent.js http://localhost:5173
```

### Devices tested

| Device | Browser | Viewport |
|--------|---------|----------|
| Windows 11 | Chrome (latest) | 1280×720 |
| macOS Sonoma | Safari | 1280×720 |
| Windows 11 | Firefox (latest) | 1280×720 |
| iPhone 15 | Safari (iOS 17) | 393×852 |
| Galaxy S24 | Chrome (Android 14) | 360×780 |

### How it works

1. 🌐 **Connects** to BrowserStack's cloud via Playwright
2. 📸 **Takes screenshots** on each browser/device
3. ⚠️ **Captures** console errors and page failures
4. 🧠 **Analyzes** all results with Gemini AI
5. 📋 **Reports** cross-browser issues and recommendations

> Screenshots are saved to `.agent/screenshots/`


## Plugins

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
