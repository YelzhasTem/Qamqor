// Part 2 screenshots (same prerequisites as e2e.cjs). Run npm run demo:reset first.
// node shots.js  -> docs/screenshots/part-2/<locale>-<width>/NN-name.png
const fs = require('fs');
const { chromium, BASE, login, newContext, collectErrors, noHorizontalScroll } = require('./lib.cjs');
const { db } = require('./db.cjs');
const OUT = require('path').resolve(__dirname, '../..') + '/docs/screenshots/part-2';
const V = (n) => `volunteer${String(n).padStart(2, '0')}@demo.qamqor.test`;

(async () => {
  const { data: projects } = await db.from('projects').select('id,title');
  const pid = (title) => `/projects/${projects.find((p) => p.title === title).id}`;
  const fair = pid('Ярмарка вещей для семей с детьми'), reading = pid('Чтение книг в доме престарелых'), dogs = pid('Выгул собак из приюта');
  const food = pid('Сбор продуктовых наборов для пожилых'), sorting = pid('Пункт раздельного сбора на фестивале');
  const screens = [
    ['01-feed-mine', V(10), '/dashboard'],
    ['02-feed-all', V(10), '/dashboard?tab=all'],
    ['03-organization-picker', V(36), '/organizations'],
    ['04-project-signed-out', null, reading],
    ['05-bar-apply', V(1), reading],
    ['06-bar-apply-join-notice', V(1), dogs],
    ['07-bar-pending', V(23), fair],
    ['08-cancel-confirm-sheet', V(23), fair, async (p) => { await p.getByRole('button', { name: /Отменить заявку|Өтінімді қайтарып алу|Cancel application/ }).click(); await p.getByRole('dialog').waitFor(); await p.waitForTimeout(400); }],
    ['09-bar-approved', V(10), fair],
    ['10-bar-rejected', V(26), reading],
    ['11-bar-completed', V(1), food],
    ['12-bar-attended-closed', V(13), food],
    ['13-bar-closed', V(2), food],
    ['14-bar-no-places', V(14), sorting],
    ['15-applications-upcoming', V(24), '/applications'],
    ['16-applications-past', V(1), '/applications?tab=past'],
    ['17-qr', V(10), '/qr'],
    ['18-qr-empty', V(14), '/qr'],
    ['19-hours', V(10), '/hours'],
    ['20-profile', V(24), '/profile'],
    ['21-leave-sheet', V(24), '/profile', async (p) => { await p.locator('button[aria-label*="Демо · Помощь людям"]').first().click(); await p.getByRole('dialog').waitFor(); await p.waitForTimeout(400); }],
  ];
  const variants = [['ru', 390], ['ru', 1280], ['kk', 390], ['en', 390]];
  const browser = await chromium.launch();
  const problems = [];
  for (const [locale, width] of variants) {
    const dir = `${OUT}/${locale}-${width}`; fs.mkdirSync(dir, { recursive: true });
    const contexts = new Map();
    for (const [name, who, path, act] of screens) {
      if (!contexts.has(who)) {
        const ctx = await newContext(browser, { width, height: width > 700 ? 900 : 844, locale });
        const page = await ctx.newPage(); const errors = []; collectErrors(page, errors);
        if (who) await login(page, who);
        contexts.set(who, { ctx, page, errors });
      }
      const { page, errors } = contexts.get(who);
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
      await page.waitForTimeout(500);
      if (act) await act(page);
      await page.screenshot({ path: `${dir}/${name}.png`, fullPage: !act && !name.includes('-bar-') });
      if (!(await noHorizontalScroll(page))) problems.push(`${locale}-${width} ${name}: horizontal scroll`);
      if (errors.length) { problems.push(`${locale}-${width} ${name}: ${errors.join(' | ').slice(0, 200)}`); errors.length = 0; }
    }
    for (const { ctx } of contexts.values()) await ctx.close();
    console.log('done', locale, width);
  }
  // 360px horizontal-scroll sweep (ru) for the volunteer screens.
  const ctx = await newContext(browser, { width: 360, height: 780 }); const page = await ctx.newPage(); await login(page, V(24));
  for (const path of ['/dashboard', '/dashboard?tab=all', '/applications', '/applications?tab=past', '/qr', '/hours', '/profile', fair, dogs]) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    if (!(await noHorizontalScroll(page))) problems.push(`360 ${path}: horizontal scroll`);
  }
  await browser.close();
  console.log(problems.length ? problems.join('\n') : 'no horizontal scroll at 360/390/1280, no console errors');
})().catch((e) => { console.error(e); process.exit(1); });
