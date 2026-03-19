const { chromium } = require('playwright');
const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(TARGET_URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3000);

  const analysis = await page.evaluate(() => {
    const findings = {};

    // Images without alt
    const imgs = document.querySelectorAll('img');
    const noAlt = [];
    imgs.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-hidden')) {
        noAlt.push({ src: img.src?.substring(0, 80) });
      }
    });
    findings.imagesWithoutAlt = noAlt;
    findings.totalImages = imgs.length;

    // Headings
    const headings = [];
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
      headings.push({ tag: h.tagName, text: h.textContent?.trim().substring(0, 60) });
    });
    findings.headings = headings;

    // Broken links
    const brokenLinks = [];
    document.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href === '') {
        brokenLinks.push({ text: a.textContent?.trim().substring(0, 40), href });
      }
    });
    findings.brokenLinks = brokenLinks;

    // Buttons without labels
    const noLabelBtns = [];
    document.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent?.trim();
      const ariaLabel = btn.getAttribute('aria-label');
      if (!text && !ariaLabel) {
        noLabelBtns.push({ classes: btn.className?.substring(0, 80) });
      }
    });
    findings.buttonsWithoutLabels = noLabelBtns;

    // Overflow
    findings.hasHorizontalOverflow = document.body.scrollWidth > window.innerWidth;

    // Fonts
    const fonts = new Set();
    document.querySelectorAll('h1, h2, h3, p, a, span, button, li').forEach(el => {
      const cs = window.getComputedStyle(el);
      if (el.textContent?.trim()) fonts.add(cs.fontFamily.split(',')[0].trim().replace(/"/g, ''));
    });
    findings.fontsUsed = Array.from(fonts);

    // Semantic HTML
    findings.semanticElements = {
      header: document.querySelectorAll('header').length,
      nav: document.querySelectorAll('nav').length,
      main: document.querySelectorAll('main').length,
      section: document.querySelectorAll('section').length,
      article: document.querySelectorAll('article').length,
      footer: document.querySelectorAll('footer').length,
    };

    // Meta tags
    findings.metaTags = {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || null,
      ogTitle: document.querySelector('meta[property="og:title"]')?.content || null,
      viewport: document.querySelector('meta[name="viewport"]')?.content || null,
    };

    // Interactive elements
    findings.interactive = {
      buttons: document.querySelectorAll('button').length,
      links: document.querySelectorAll('a').length,
      inputs: document.querySelectorAll('input, textarea, select').length,
    };

    // Skip link
    const skipLink = document.querySelector('.sr-only');
    findings.hasSkipLink = skipLink ? skipLink.textContent?.trim() : null;

    // Videos
    findings.videos = document.querySelectorAll('video').length;

    // All text in each section
    const sectionTexts = [];
    document.querySelectorAll('section').forEach((s, i) => {
      const id = s.id || s.className?.substring(0, 30) || `section-${i}`;
      const h = s.querySelector('h1, h2, h3');
      sectionTexts.push({ id, heading: h?.textContent?.trim().substring(0, 50) || 'none' });
    });
    findings.sections = sectionTexts;

    return findings;
  });

  console.log(JSON.stringify(analysis, null, 2));
  await browser.close();
})();
