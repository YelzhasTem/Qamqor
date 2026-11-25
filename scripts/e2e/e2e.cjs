// Part 2 volunteer flows against the local dev server (npm run dev) after npm run demo:reset.
// Playwright is not a project dependency: run with a globally available playwright, e.g. NODE_PATH=$(npm root -g) node scripts/e2e/e2e.cjs
const { chromium, BASE, login, newContext, collectErrors } = require('./lib.cjs');
const { db, userId } = require('./db.cjs');

const results = [];
function check(name, ok, extra = '') { results.push({ name, ok }); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? '  ' + extra : ''}`); }
let readingId;

async function session(browser, email, opts = {}) {
  const ctx = await newContext(browser, opts); const page = await ctx.newPage(); const errors = []; collectErrors(page, errors);
  await login(page, email); return { ctx, page, errors };
}
async function placesText(page) { return (await page.locator('main').innerText()).match(/Свободно \d+ из \d+/)?.[0]; }
async function free(page) { return Number((await placesText(page)).match(/\d+/)[0]); }
async function bar(page) { return page.locator('div.fixed.bottom-0').last().innerText(); }
async function freeSettled(page, expected) { for (let i = 0; i < 20; i++) { const n = await free(page); if (n === expected) return n; await page.waitForTimeout(500); } return free(page); }
async function decodeQr(page) {
  const svg = page.locator('svg[data-checkin-url]'); const png = await svg.screenshot();
  await page.addScriptTag({ path: require('path').resolve(__dirname, '../..') + '/node_modules/jsqr/dist/jsQR.js' });
  const decoded = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height); return window.jsQR(d.data, d.width, d.height)?.data ?? null;
  }, png.toString('base64'));
  return { decoded, attr: await svg.getAttribute('data-checkin-url') };
}
async function coordinatorSet(browser, projectId, volunteerName, label) {
  const { ctx, page } = await session(browser, 'coordinator.help@demo.qamqor.test', { width: 1280, height: 900 });
  await page.goto(`${BASE}/coordinator/projects/${projectId}/applications`, { waitUntil: 'networkidle' });
  const row = page.locator('div.rounded-2xl', { hasText: volunteerName }).first();
  await row.getByRole('button', { name: label }).click();
  await page.waitForTimeout(1500); await page.waitForLoadState('networkidle');
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  const { data: projects } = await db.from('projects').select('id,title');
  readingId = projects.find((p) => p.title === 'Чтение книг в доме престарелых').id;

  // 1. Volunteer with one organization: feed tabs, apply, pending everywhere.
  const v1 = await session(browser, 'volunteer01@demo.qamqor.test');
  await v1.page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  let text = await v1.page.locator('main').innerText();
  check('feed mine shows only Помощь людям projects', text.includes('Чтение книг') && !text.includes('Выгул собак') && !text.includes('Посадка деревьев'));
  await v1.page.getByRole('radio', { name: 'Все проекты' }).click(); await v1.page.waitForURL(/tab=all/); await v1.page.waitForLoadState('networkidle');
  text = await v1.page.locator('main').innerText();
  check('feed all shows other organizations', text.includes('Выгул собак') && text.includes('Посадка деревьев'));
  check('feed has no draft or completed projects', !text.includes('Фотосессия для котов') && !text.includes('Сбор продуктовых'));
  await v1.page.goto(`${BASE}/projects/${readingId}`, { waitUntil: 'networkidle' });
  const freeBefore = await free(v1.page);
  await v1.page.getByRole('button', { name: 'Записаться' }).click();
  await v1.page.getByText('На рассмотрении').first().waitFor({ timeout: 10000 });
  await v1.page.waitForLoadState('networkidle');
  check('apply shows pending badge in the bar', (await bar(v1.page)).includes('На рассмотрении'));
  check('pending application takes no place', (await free(v1.page)) === freeBefore, `${freeBefore}`);
  await v1.page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  check('feed card shows pending', (await v1.page.locator('a', { hasText: 'Чтение книг' }).first().innerText()).includes('На рассмотрении'));
  await v1.page.goto(BASE + '/applications', { waitUntil: 'networkidle' });
  check('/applications lists it as pending', (await v1.page.locator('main').innerText()).match(/Чтение книг[\s\S]*На рассмотрении|На рассмотрении[\s\S]*Чтение книг/) !== null);

  // Cancel the pending application, then apply again.
  await v1.page.goto(`${BASE}/projects/${readingId}`, { waitUntil: 'networkidle' });
  await v1.page.getByRole('button', { name: 'Отменить заявку' }).click();
  await v1.page.getByRole('dialog').getByRole('button', { name: /Отменить/ }).first().click();
  await v1.page.getByRole('button', { name: 'Записаться' }).waitFor({ timeout: 10000 });
  check('cancel pending returns the apply button', true);
  const { count: v1Rows } = await db.from('project_applications').select('id', { count: 'exact', head: true }).eq('project_id', readingId).eq('volunteer_id', await userId('volunteer01@demo.qamqor.test'));
  check('cancelled pending row is deleted', v1Rows === 0);
  await v1.page.getByRole('button', { name: 'Записаться' }).click();
  await v1.page.getByText('На рассмотрении').first().waitFor({ timeout: 10000 });

  // 2. Coordinator approves; next-event card and QR.
  await coordinatorSet(browser, readingId, 'Айгерим Сейткали', 'Принять');
  await v1.page.goto(`${BASE}/projects/${readingId}`, { waitUntil: 'networkidle' });
  check('approved takes a place', (await free(v1.page)) === freeBefore - 1, `${freeBefore} -> ${await free(v1.page)}`);
  check('bar shows approved and Мой QR', (await bar(v1.page)).includes('Одобрена') && (await bar(v1.page)).includes('Мой QR'));
  await v1.page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  text = await v1.page.locator('main').innerText();
  check('next-event card shows the approved event', (await v1.page.getByRole('region', { name: 'Ближайшее событие' }).innerText()).includes('Чтение книг'));
  await v1.page.getByRole('link', { name: /Мой QR/ }).first().click(); await v1.page.waitForURL(/\/qr/); await v1.page.waitForLoadState('networkidle');
  const qr = await decodeQr(v1.page);
  const { data: appRow } = await db.from('project_applications').select('id,checkin_code,status').eq('project_id', readingId).eq('volunteer_id', await userId('volunteer01@demo.qamqor.test')).single();
  check('QR decodes to the check-in URL of this application', qr.decoded === qr.attr && qr.decoded === `http://localhost:3000/checkin/${appRow.checkin_code}`, qr.decoded);

  // 3. Mark attended: /qr updates without a reload.
  await coordinatorSet(browser, readingId, 'Айгерим Сейткали', 'Отметить участие');
  const t0 = Date.now();
  await v1.page.getByText('Вы отмечены').waitFor({ timeout: 25000 });
  check('/qr shows Вы отмечены without reload', true, `${Math.round((Date.now() - t0) / 1000)}s`);
  await v1.ctx.close();

  // 4. Cancel an approved application: the place is freed.
  const v7 = await session(browser, 'volunteer07@demo.qamqor.test');
  await v7.page.goto(`${BASE}/projects/${readingId}`, { waitUntil: 'networkidle' });
  const f0 = await free(v7.page);
  await v7.page.getByRole('button', { name: 'Записаться' }).click(); await v7.page.getByText('На рассмотрении').first().waitFor();
  await coordinatorSet(browser, readingId, 'Жанар Омарова', 'Принять');
  await v7.page.reload({ waitUntil: 'networkidle' });
  const f1 = await free(v7.page);
  await v7.page.getByRole('button', { name: 'Отменить', exact: true }).click();
  await v7.page.getByRole('dialog').getByRole('button', { name: /Отменить/ }).first().click();
  await v7.page.getByRole('button', { name: 'Записаться' }).waitFor({ timeout: 10000 }); await v7.page.waitForLoadState('networkidle');
  const f2 = await freeSettled(v7.page, f0);
  check('cancel approved frees the place', f1 === f0 - 1 && f2 === f0, `${f0} -> ${f1} -> ${f2}`);
  await v7.ctx.close();

  // 5. Volunteer without organizations.
  const v36 = await session(browser, 'volunteer36@demo.qamqor.test');
  check('volunteer36 lands on the organization picker', v36.page.url().includes('/organizations'));
  await v36.page.getByRole('button', { name: 'Продолжить' }).click(); await v36.page.waitForURL(/dashboard/); await v36.page.waitForLoadState('networkidle');
  check('empty feed explains there are no memberships', await v36.page.getByText('Вы пока не вступили ни в одну организацию').waitFor({ timeout: 15000 }).then(() => true, () => false));
  await v36.page.goto(BASE + '/dashboard?tab=all', { waitUntil: 'networkidle' });
  check('all tab lists projects', (await v36.page.locator('main').innerText()).includes('Выгул собак'));
  const dogs = projects.find((p) => p.title === 'Выгул собак из приюта').id;
  await v36.page.goto(`${BASE}/projects/${dogs}`, { waitUntil: 'networkidle' });
  check('bar warns about joining the organization', (await bar(v36.page)).includes('Демо · Животные'));
  await v36.page.getByRole('button', { name: 'Записаться' }).click(); await v36.page.getByText('На рассмотрении').first().waitFor();
  const v36Id = await userId('volunteer36@demo.qamqor.test');
  const { data: mem } = await db.from('organization_members').select('role,organizations(name)').eq('user_id', v36Id);
  check('applying created the membership', mem.length === 1 && mem[0].organizations.name === 'Демо · Животные' && mem[0].role === 'volunteer');
  await v36.page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  check('mine feed now shows that organization', (await v36.page.locator('main').innerText()).includes('Выгул собак'));

  // 6. Leave with a count.
  await v36.page.goto(BASE + '/profile', { waitUntil: 'networkidle' });
  await v36.page.getByRole('button', { name: 'Выйти из организации «Демо · Животные»' }).click();
  const dialogText = await v36.page.getByRole('dialog').innerText();
  check('leave sheet states the count', dialogText.includes('Будет отменена 1 заявка'), dialogText.replace(/\s+/g, ' ').slice(0, 160));
  await v36.page.getByRole('dialog').getByRole('button', { name: 'Выйти', exact: true }).click();
  await v36.page.getByText('Отменена 1 заявка').waitFor({ timeout: 10000 });
  const { count: left } = await db.from('project_applications').select('id', { count: 'exact', head: true }).eq('volunteer_id', v36Id);
  const { count: memLeft } = await db.from('organization_members').select('user_id', { count: 'exact', head: true }).eq('user_id', v36Id);
  check('leave removed the application and the membership', left === 0 && memLeft === 0);
  await v36.ctx.close();

  // 7. Hours totals and certificate PDF.
  const v10 = await session(browser, 'volunteer10@demo.qamqor.test');
  const v10Id = await userId('volunteer10@demo.qamqor.test');
  const { data: hrs } = await db.from('volunteer_hours').select('hours,status').eq('volunteer_id', v10Id);
  const confirmed = hrs.filter((h) => h.status === 'confirmed').reduce((s, h) => s + Number(h.hours), 0);
  await v10.page.goto(BASE + '/hours', { waitUntil: 'networkidle' });
  text = await v10.page.locator('main').innerText();
  check('/hours total matches confirmed hours in the DB', new RegExp(`(^|\\D)${String(confirmed).replace('.', '[.,]')}(\\D|$)`).test(text), `db=${confirmed}`);
  const certLink = v10.page.getByRole('link', { name: /PDF|Скачать|сертификат/i }).first();
  if (await certLink.count()) {
    const href = await certLink.getAttribute('href');
    const res = await v10.page.request.get(new URL(href, BASE).toString());
    const body = await res.body();
    
    check('certificate PDF downloads', res.ok() && body.slice(0, 5).toString() === '%PDF-', `${body.length} bytes`);
  } else check('certificate link present', false);
  await v10.ctx.close();

  // 8. Coordinator and admin screens.
  const c = await session(browser, 'coordinator.eco@demo.qamqor.test', { width: 1280, height: 900 });
  const { data: ecoProjects } = await db.from('projects').select('id').eq('organization_id', (await db.from('organizations').select('id').eq('name', 'Демо · Экология').single()).data.id);
  for (const path of ['/dashboard', '/coordinator/projects', '/coordinator/projects/new', `/coordinator/projects/${ecoProjects[0].id}/applications`, `/coordinator/projects/${ecoProjects[0].id}/edit`, '/profile', '/cabinet']) {
    const r = await c.page.goto(BASE + path, { waitUntil: 'networkidle' });
    check(`coordinator ${path} loads`, r.ok() && !(await c.page.locator('body').innerText()).includes('Application error'));
  }
  check('coordinator screens without console errors', c.errors.length === 0, c.errors.join(' | ').slice(0, 300));
  await c.ctx.close();
  const a = await session(browser, 'admin@demo.qamqor.test', { width: 1280, height: 900 });
  for (const path of ['/dashboard', '/admin/users', '/profile']) {
    const r = await a.page.goto(BASE + path, { waitUntil: 'networkidle' });
    check(`admin ${path} loads`, r.status() < 400, String(r.status()));
  }
  check('admin screens without console errors', a.errors.length === 0, a.errors.join(' | ').slice(0, 300));
  await a.ctx.close();

  // 9. Same Almaty time on every screen in all three languages (Посадка деревьев: 10:00–14:00 Almaty).
  const trees = projects.find((p) => p.title === 'Посадка деревьев в парке Демо').id;
  for (const locale of ['ru', 'kk', 'en']) {
    const v = await session(browser, 'volunteer02@demo.qamqor.test', { locale, tz: 'America/Los_Angeles' });
    await v.page.goto(`${BASE}/projects/${trees}`, { waitUntil: 'networkidle' });
    const p = await v.page.locator('main').innerText();
    await v.page.goto(BASE + '/dashboard?tab=all', { waitUntil: 'networkidle' });
    const f = await v.page.locator('a', { hasText: 'Посадка деревьев' }).first().innerText();
    await v.page.goto(BASE + '/applications', { waitUntil: 'networkidle' });
    const ap = await v.page.locator('main').innerText();
    check(`${locale}: project page 10:00–14:00, feed card 10:00`, p.includes('10:00–14:00') && f.includes('10:00'), `${p.match(/.*10:00.*/)?.[0]} / ${f.replace(/\n/g, ' ').slice(0, 90)}`);
    check(`${locale}: /applications shows Almaty times`, !/\b(21|20|23):00\b/.test(ap));
    check(`${locale}: no console errors`, v.errors.length === 0, v.errors.join(' | ').slice(0, 200));
    await v.ctx.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
