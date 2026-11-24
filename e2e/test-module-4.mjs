/**
 * SkillBridge E2E — Module 4 (Applications).
 * Run: node test-module-4.mjs
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const API = 'http://localhost:5000/api';
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

  const email = `e2e.apply.${Date.now()}@test.com`;

  /* Setup: register fresh student */
  await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
  await page.fill('input[name="name"]', 'Apply Tester');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'Test@1234');
  await page.fill('input[name="confirm"]', 'Test@1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/app', { timeout: 10000 });

  /* 1. Apply flow */
  await check('Apply: dashboard starts with 0 applications', async () => {
    await page.waitForSelector('p:has-text("Applications submitted")', { timeout: 8000 });
    await page.waitForTimeout(900); // allow stats fetch to settle
    const card = page.locator('div.rounded-2xl', { hasText: 'Applications submitted' }).first();
    const val = await card.locator('p.text-2xl').textContent();
    if (val.trim() !== '0') throw new Error(`expected 0, got ${val}`);
  });

  await check('Apply: open detail → click Apply → modal opens', async () => {
    await page.goto(`${BASE}/app/internships`, { waitUntil: 'networkidle' });
    await page.click('a:has-text("Frontend Engineering Intern")');
    await page.waitForSelector('h1:has-text("Frontend Engineering Intern")', { timeout: 10000 });
    await page.click('button:has-text("Apply for this internship")');
    await page.waitForSelector('[role="dialog"]:has-text("Apply for this internship")', { timeout: 5000 });
  });

  await check('Apply: client validation blocks short cover letter', async () => {
    await page.fill('textarea[name="coverLetter"]', 'short');
    await page.click('button:has-text("Submit application")');
    await page.waitForSelector('text=/Cover letter must be at least 30/', { timeout: 5000 });
    if (!(await page.locator('[role="dialog"]').isVisible())) throw new Error('modal closed unexpectedly');
  });

  await check('Apply: valid submission succeeds and shows applied state', async () => {
    await page.fill(
      'textarea[name="coverLetter"]',
      'Dear NovaLabs team, I am a passionate frontend developer with strong React skills and I would love to contribute to your product dashboard work this semester.'
    );
    // resume prefilled from profile may be empty → fill it
    const resume = page.locator('input[name="resume"]');
    if (!((await resume.inputValue()) || '').trim()) await resume.fill('https://drive.google.com/apply-test.pdf');
    await page.click('button:has-text("Submit application")');
    await page.waitForSelector('text=Application submitted', { timeout: 10000 });
    await page.waitForSelector('text=Track in My Applications', { timeout: 8000 });
  });

  await check('Apply: duplicate prevention — no Apply button after applying', async () => {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('text=Track in My Applications', { timeout: 10000 });
    const applyBtn = page.locator('button:has-text("Apply for this internship")');
    if (await applyBtn.count()) throw new Error('Apply button still present after applying');
  });

  /* 2. My Applications page */
  await check('My Applications shows the pending application', async () => {
    await page.goto(`${BASE}/app/applications`, { waitUntil: 'networkidle' });
    await page.waitForSelector('h3:has-text("Frontend Engineering Intern")', { timeout: 10000 });
    await page.waitForSelector('span:has-text("Pending")', { timeout: 5000 });
    await page.waitForTimeout(600);
    const card = page.locator('div.rounded-2xl', { hasText: 'Applications submitted' }).first();
    const submitted = await card.locator('p.text-2xl').textContent();
    if (submitted.trim() !== '1') throw new Error(`expected 1 submitted, got ${submitted}`);
  });

  await check('My Applications: status tab filter works', async () => {
    await page.click('button:has-text("Rejected")');
    await page.waitForSelector('text=No', { timeout: 5000 });
    const body = await page.locator('main').innerText();
    if (body.includes('Frontend Engineering Intern')) throw new Error('listing visible under Rejected tab');
    await page.click('button:has-text("All")');
    await page.waitForSelector('h3:has-text("Frontend Engineering Intern")', { timeout: 5000 });
  });

  /* 3. Admin changes status via API (setup), student sees it live */
  await check('Status change by admin is visible to student', async () => {
    const login = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@skillbridge.dev', password: 'Admin@123' }),
    }).then((r) => r.json());
    const atok = login.data.token;

    const list = await fetch(`${API}/applications`, {
      headers: { Authorization: `Bearer ${atok}` },
    }).then((r) => r.json());
    const target = list.data.applications.find((a) => a.student?.email === email);
    if (!target) throw new Error('application not visible in admin list');

    const upd = await fetch(`${API}/applications/${target._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${atok}` },
      body: JSON.stringify({ status: 'Accepted' }),
    }).then((r) => r.json());
    if (upd.data.application.status !== 'Accepted') throw new Error('status not updated');

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('span:has-text("Accepted")', { timeout: 10000 });
  });

  await check('Dashboard accepted stat updates after acceptance', async () => {
    await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
    await page.waitForSelector('p:has-text("Accepted applications")', { timeout: 8000 });
    await page.waitForTimeout(900);
    const card = page.locator('div.rounded-2xl', { hasText: 'Accepted applications' }).first();
    const val = await card.locator('p.text-2xl').textContent();
    if (val.trim() !== '1') throw new Error(`expected 1 accepted, got ${val}`);
    const summaryVisible = await page.locator('h3:has-text("Application status summary")').isVisible();
    if (!summaryVisible) throw new Error('status summary missing');
  });

  /* 4. API-level duplicate check from the UI session token */
  await check('Server rejects duplicate application (409)', async () => {
    const login = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Test@1234' }),
    }).then((r) => r.json());
    const stok = login.data.token;
    const ix = await fetch(`${API}/internships?q=Frontend`).then((r) => r.json());
    const dup = await fetch(`${API}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${stok}` },
      body: JSON.stringify({
        internshipId: ix.data.internships[0]._id,
        coverLetter: 'This is a duplicate cover letter attempt that is long enough to pass validation checks.',
        resume: 'https://x.com/r.pdf',
      }),
    });
    if (dup.status !== 409) throw new Error(`expected 409, got ${dup.status}`);
  });

  await browser.close();

  console.log('\n========= E2E RESULTS (Module 4) =========');
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
