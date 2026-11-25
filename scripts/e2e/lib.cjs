const { chromium } = require('playwright');
const BASE = 'http://localhost:3000';
// The shared local demo password from docs/DEMO.md (local stack only).
const PASSWORD = process.env.DEMO_PASSWORD ?? 'qamqor-demo-local';
async function newContext(browser, { width = 390, height = 844, locale = 'ru', tz = 'Europe/Berlin' } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, timezoneId: tz });
  await ctx.addCookies([{ name: 'qamqor-language', value: locale, url: BASE }]);
  return ctx;
}
async function login(page, email) {
  await page.goto(BASE + '/auth/login', { waitUntil: 'networkidle' });
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', PASSWORD);
  await Promise.all([page.waitForURL(u => !u.pathname.startsWith('/auth/login'), { timeout: 30000 }), page.click('button[type=submit]')]);
  await page.waitForLoadState('networkidle');
}
function collectErrors(page, list) {
  page.on('console', m => { if (m.type() === 'error') list.push(m.text()); });
  page.on('pageerror', e => list.push(String(e)));
}
async function noHorizontalScroll(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}
module.exports = { chromium, BASE, login, newContext, collectErrors, noHorizontalScroll };
