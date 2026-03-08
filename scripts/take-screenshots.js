#!/usr/bin/env node
/**
 * Screenshot capture script for README documentation.
 * Uses puppeteer-core with the system's Chrome installation.
 */
const puppeteer = require('puppeteer-core');
const path = require('path');

const BASE_URL = 'http://localhost:5001';
const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

const pages = [
  { name: 'landing',       path: '/',            wait: 2000 },
  { name: 'appointments',         path: '/appointments',       wait: 1500 },
  { name: 'reviews',        path: '/reviews',      wait: 1500 },
//   { name: 'about',         path: '/',       wait: 1500 },
  { name: 'signup',          path: '/signup',        wait: 1500 },
];

(async () => {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  for (const pg of pages) {
    const url = `${BASE_URL}${pg.path}`;
    console.log(`Capturing ${pg.name} → ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, pg.wait));
      await page.screenshot({
        path: path.join(OUT_DIR, `${pg.name}.png`),
        fullPage: false
      });
      console.log(`  ✓ ${pg.name}.png saved`);
    } catch (err) {
      console.error(`  ✗ Failed ${pg.name}:`, err.message);
    }
  }

  // Full-page screenshot of landing
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({
      path: path.join(OUT_DIR, 'landing-full.png'),
      fullPage: true
    });
    console.log('  ✓ landing-full.png saved');
  } catch (err) {
    console.error('  ✗ Failed landing-full:', err.message);
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to docs/screenshots/');
})();
