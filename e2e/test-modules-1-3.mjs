/**
 * SkillBridge E2E smoke tests (Modules 1-3) — Playwright + Chromium.
 * Run: node test-modules-1-3.mjs
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
let passed = 0;
let failed = 0;
const results = [];
const consoleErrors = [];

const ok = (name) => { passed++; results.push(`  ✅ ${name}`); };
const bad = (name, err) => { failed++; results.push(`  ❌ ${name} — ${String(err).slice(0, 300)}`); };

async function check(name, fn) {
  try { await fn(); ok(name); }
  catch (e) { bad(name, e); }
}

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300));
  });
  page.on('pageerror', (err) => consoleErrors.push(`PAGEERROR: ${String(err).slice(0, 300)}`));

  const email = `e2e.student.${Date.now()}@test.com`;

  /* ------------------------------ 1. Landing ------------------------------ */
  await check('Landing page renders hero + navbar', async () => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForSelector('h1:has-text("Bridge the gap")', { timeout: 10000 });
    const loginLink = await page.locator('header a:has-text("Log in")').first().isVisible();
    if (!loginLink) throw new Error('Login link not visible');
  });

  /* --------------------------- 2. Register flow --------------------------- */
  await check('Register creates student and lands on /app dashboard', async () => {
    await page.click('header a:has-text("Get started")');
    await page.waitForURL('**/register', { timeout: 8000 });
    await page.fill('input[name="name"]', 'E2E Student');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Test@1234');
    await page.fill('input[name="confirm"]', 'Test@1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app', { timeout: 10000 });
    await page.waitForSelector('text=Welcome back, E2E', { timeout: 8000 });
  });

  await check('Dashboard shows real "Internships available" count (=10 sample)', async () => {
    const stat = page.locator('p.font-extrabold', { hasText: /^\d+$/ }).first();
    await stat.waitFor({ timeout: 10000 });
    const val = await stat.textContent();
    if (Number(val) < 10) throw new Error(`Expected >=10, got ${val}`);
  });

  await check('Dashboard shows recently posted internships (real API)', async () => {
    await page.waitForSelector('h3:has-text("Recently posted internships")', { timeout: 8000 });
    // Newest 4 listings are shown — assert real sample titles appear as links
    await page.waitForSelector(
      'a:has-text("Quality Assurance Intern"), a:has-text("HR & Talent Acquisition Intern"), a:has-text("Frontend Engineering Intern")',
      { timeout: 10000 }
    );
    const recentCards = await page.locator('h3:has-text("Recently posted internships") ~ div a.group, h3:has-text("Recently posted internships")').first().isVisible();
    if (!recentCards) throw new Error('recent section not visible');
  });

  await check('Sidebar contains Explore Internships nav item', async () => {
    const visible = await page.locator('aside a:has-text("Explore Internships")').first().isVisible();
    if (!visible) throw new Error('nav item missing');
  });

  /* ------------------------- 3. Role route guard -------------------------- */
  await check('Student visiting /admin is redirected to /app', async () => {
    await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
    await page.waitForURL('**/app', { timeout: 8000 });
  });

  /* --------------------------- 4. Explorer page --------------------------- */
  await check('Explorer loads internship cards', async () => {
    await page.click('aside a:has-text("Explore Internships")');
    await page.waitForURL('**/app/internships', { timeout: 8000 });
    await page.waitForSelector('text=internships found', { timeout: 10000 });
    const cards = await page.locator('a.group:has(h3)').count();
    if (cards < 5) throw new Error(`Expected >=5 cards, got ${cards}`);
  });

  await check('Search "react" filters results', async () => {
    await page.fill('input[name="q"]', 'react');
    await page.waitForFunction(
      () => document.body.innerText.includes('internships found'),
      { timeout: 8000 }
    );
    await page.waitForTimeout(900); // debounce + fetch
    const text = await page.locator('text=internships found').first().textContent();
    const n = parseInt(text.replace(/\D/g, ''), 10);
    if (!(n >= 1 && n <= 5)) throw new Error(`Unexpected count "${text}"`);
    const body = await page.locator('body').innerText();
    if (!/Full Stack|Frontend/i.test(body)) throw new Error('react results missing');
  });

  await check('Work-mode chip filter (Remote) applies', async () => {
    await page.fill('input[name="q"]', '');
    await page.waitForTimeout(900);
    await page.click('button:has-text("Remote")');
    await page.waitForTimeout(900);
    const body = await page.locator('main').innerText();
    if (!body.includes('UI/UX Design Intern')) throw new Error('Remote filter did not apply');
    if (body.includes('Financial Analysis Intern')) throw new Error('On-site listing leaked through Remote filter');
  });

  await check('Clear filters restores full list', async () => {
    await page.click('text=Clear all filters ✕');
    await page.waitForTimeout(900);
    const text = await page.locator('text=internships found').first().textContent();
    const n = parseInt(text.replace(/\D/g, ''), 10);
    if (n !== 10) throw new Error(`Expected 10, got ${text}`);
  });

  /* ---------------------------- 5. Detail page ---------------------------- */
  await check('Internship detail page renders full info', async () => {
    await page.click('a:has-text("Frontend Engineering Intern")');
    await page.waitForURL('**/app/internships/**', { timeout: 8000 });
    await page.waitForSelector('h1:has-text("Frontend Engineering Intern")', { timeout: 10000 });
    for (const t of ['About this internship', "Skills you'll use", 'Key details', 'NovaLabs Technologies']) {
      const vis = await page.locator(`text=${t}`).first().isVisible();
      if (!vis) throw new Error(`Missing: ${t}`);
    }
  });

  /* ------------------------------ 6. Logout ------------------------------- */
  await check('Logout returns to landing page', async () => {
    await page.click('button[title="Log out"]');
    await page.waitForURL(`${BASE}/`, { timeout: 8000 });
    await page.waitForSelector('h1:has-text("Bridge the gap")', { timeout: 8000 });
  });

  /* --------------------- 7. Guest guard + bad login ----------------------- */
  await check('Unauthenticated /app redirects to /login', async () => {
    await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
    await page.waitForURL('**/login', { timeout: 8000 });
  });

  await check('Wrong password shows error toast, stays on /login', async () => {
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'WrongPass123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Invalid email or password', { timeout: 8000 });
    if (!page.url().includes('/login')) throw new Error('Navigated away on failure');
  });

  /* --------------------------- 8. Student login --------------------------- */
  await check('Student login returns to dashboard with session', async () => {
    await page.fill('input[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app', { timeout: 10000 });
    await page.waitForSelector('text=Welcome back, E2E', { timeout: 8000 });
  });

  /* --------------------------- 9. Admin login ----------------------------- */
  await check('Admin login lands on /admin (role-based home)', async () => {
    await page.click('button[title="Log out"]');
    await page.waitForURL(`${BASE}/`, { timeout: 8000 });
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', 'admin@skillbridge.dev');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin', { timeout: 10000 });
    // Admin dashboard renders live KPI cards
    await page.waitForSelector('p:has-text("Registered students")', { timeout: 10000 });
  });

  await check('Admin visiting /app (student area) is redirected', async () => {
    await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
    await page.waitForURL('**/admin', { timeout: 8000 });
  });

  /* --------------------------- 10. Mobile layout -------------------------- */
  await check('Mobile viewport: sidebar drawer opens', async () => {
    await page.click('button[title="Log out"]');
    await page.waitForURL(`${BASE}/`, { timeout: 8000 });
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Test@1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app', { timeout: 10000 });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    const menuBtn = page.locator('button[aria-label="Open menu"]');
    if (!(await menuBtn.isVisible())) throw new Error('mobile menu button missing');
    await menuBtn.click();
    // Mobile drawer is the LAST aside in the DOM (desktop aside is hidden at 390px)
    const mobileAside = page.locator('aside:visible').last();
    await mobileAside.locator('a:has-text("Explore Internships")').waitFor({ timeout: 5000 });
    if (!(await mobileAside.locator('a:has-text("Explore Internships")').isVisible()))
      throw new Error('drawer link not visible');
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  await browser.close();

  console.log('\n========= E2E RESULTS (Modules 1-3) =========');
  results.forEach((r) => console.log(r));
  console.log(`---------------------------------------------`);
  console.log(`passed: ${passed} | failed: ${failed}`);
  if (consoleErrors.length) {
    console.log(`\nConsole/page errors captured (${consoleErrors.length}):`);
    [...new Set(consoleErrors)].slice(0, 10).forEach((e) => console.log('  •', e));
  }
  process.exit(failed ? 1 : 0);
};

run().catch((e) => {
  console.error('E2E harness crashed:', e);
  process.exit(1);
});
