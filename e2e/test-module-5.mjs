/**
 * SkillBridge E2E — Module 5 (Student Profile).
 * Run: node test-module-5.mjs
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
let passed = 0;
let failed = 0;
const results = [];
const consoleErrors = [];

const ok = (n) => { passed++; results.push(`  ✅ ${n}`); };
const bad = (n, e) => { failed++; results.push(`  ❌ ${n} — ${String(e).slice(0, 300)}`); };
async function check(name, fn) {
  try { await fn(); ok(name); } catch (e) { bad(name, e); }
}

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 300)));
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${String(e).slice(0, 300)}`));

  const email = `e2e.profile.${Date.now()}@test.com`;

  await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
  await page.fill('input[name="name"]', 'Profile Tester');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'Test@1234');
  await page.fill('input[name="confirm"]', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/app', { timeout: 10000 });

  /* 1. Page renders */
  await check('Profile page loads with sections', async () => {
    await page.goto(`${BASE}/app/profile`, { waitUntil: 'networkidle' });
    for (const t of ['Basic information', 'Skills', 'Education', 'Links & resume']) {
      if (!(await page.locator(`h3:has-text("${t}")`).first().isVisible()))
        throw new Error(`missing section: ${t}`);
    }
    await page.waitForSelector('text=/\\d+% complete/', { timeout: 5000 });
  });

  /* 2. Validation */
  await check('Client validation blocks invalid email', async () => {
    await page.fill('input[name="email"]', 'not-an-email');
    await page.locator('button:has-text("Save changes")').first().click();
    await page.waitForSelector('text=Enter a valid email address', { timeout: 5000 });
    await page.click('button:has-text("Discard")'); // restore
    await page.waitForTimeout(300);
  });

  /* 3. Skills add/remove */
  await check('Skills: add via input + remove chip', async () => {
    await page.fill('input[name="skill-input"]', 'React Testing');
    await page.keyboard.press('Enter');
    await page.waitForSelector('span:has-text("React Testing")', { timeout: 5000 });
    await page.click('button[aria-label="Remove React Testing"]');
    await page.waitForTimeout(300);
    const count = await page.locator('span:has-text("React Testing")').count();
    if (count) throw new Error('skill not removed');
  });

  /* 4. Education add */
  await check('Education: add entry and fill fields', async () => {
    await page.click('button:has-text("Add education")');
    await page.fill('input[name="edu-inst-0"]', 'R.V. College of Engineering');
    await page.fill('input[name="edu-degree-0"]', 'B.E. Information Science');
    await page.fill('input[name="edu-field-0"]', 'Information Science');
    await page.fill('input[name="edu-start-0"]', '2023');
    await page.fill('input[name="edu-end-0"]', '2027');
    await page.fill('input[name="edu-grade-0"]', '8.9 CGPA');
  });

  /* 5. Links + save */
  await check('Save profile persists links, skills, education', async () => {
    await page.fill('input[name="github"]', 'https://github.com/profile-tester');
    await page.fill('input[name="linkedin"]', 'https://linkedin.com/in/profile-tester');
    await page.fill('input[name="resume"]', 'https://drive.google.com/profile-tester-resume');
    await page.fill('input[name="skill-input"]', 'GraphQL');
    await page.keyboard.press('Enter');
    await page.locator('button:has-text("Save changes")').first().click();
    await page.waitForSelector('text=Profile updated successfully', { timeout: 10000 });
  });

  /* 6. Persistence across reload */
  await check('Reload: changes persisted from server', async () => {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('input[name="github"][value="https://github.com/profile-tester"]', {
      timeout: 8000,
    });
    await page.waitForSelector('span:has-text("GraphQL")', { timeout: 5000 });
    const edu = await page.locator('input[name="edu-inst-0"]').inputValue();
    if (!edu.includes('R.V. College')) throw new Error(`education not persisted: ${edu}`);
    await page.waitForSelector('text=All changes saved', { timeout: 5000 });
  });

  /* 7. Completeness reflects new data */
  await check('Completeness increased after filling profile', async () => {
    const label = await page.locator('text=/\\d+% complete/').first().textContent();
    const pct = parseInt(label, 10);
    if (!(pct >= 75)) throw new Error(`expected >=75%, got ${label}`);
  });

  /* 8. Dashboard checklist reflects profile */
  await check('Dashboard checklist marks items done', async () => {
    await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Add your education details', { timeout: 8000 });
    const body = await page.locator('main').innerText();
    if (!body.includes('B.E. Information Science'))
      throw new Error('education degree not shown on dashboard');
  });

  /* 9. Sidebar profile link + profile completeness on header */
  await check('Sidebar → My Profile navigation works', async () => {
    await page.click('aside a:has-text("My Profile")');
    await page.waitForURL('**/app/profile', { timeout: 8000 });
    await page.waitForSelector('h3:has-text("Basic information")', { timeout: 5000 });
  });

  await browser.close();

  console.log('\n========= E2E RESULTS (Module 5) =========');
  results.forEach((r) => console.log(r));
  console.log('------------------------------------------');
  console.log(`passed: ${passed} | failed: ${failed}`);
  if (consoleErrors.length) {
    console.log(`\nConsole errors (${consoleErrors.length}):`);
    [...new Set(consoleErrors)].slice(0, 10).forEach((e) => console.log('  •', e));
  }
  process.exit(failed ? 1 : 0);
};

run().catch((e) => {
  console.error('E2E harness crashed:', e);
  process.exit(1);
});
