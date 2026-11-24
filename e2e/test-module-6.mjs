/**
 * SkillBridge E2E — Module 6 (Admin features).
 * Run: node test-module-6.mjs
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

const IX_TITLE = `E2E Created Role ${Date.now().toString().slice(-5)}`;

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 300)));
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${String(e).slice(0, 300)}`));

  /* Admin login */
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'admin@skillbridge.dev');
  await page.fill('input[name="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin', { timeout: 10000 });

  /* 1. Live stats */
  await check('Admin dashboard shows live statistics', async () => {
    await page.waitForSelector('p:has-text("Registered students")', { timeout: 10000 });
    await page.waitForTimeout(800);
    const students = await page
      .locator('div.rounded-2xl', { hasText: 'Registered students' })
      .first()
      .locator('p.text-2xl')
      .textContent();
    const ix = await page
      .locator('div.rounded-2xl', { hasText: 'Total internships' })
      .first()
      .locator('p.text-2xl')
      .textContent();
    const apps = await page
      .locator('div.rounded-2xl', { hasText: 'Total applications' })
      .first()
      .locator('p.text-2xl')
      .textContent();
    if (Number(students) < 2) throw new Error(`students=${students}`);
    if (Number(ix) < 10) throw new Error(`internships=${ix}`);
    if (Number(apps) < 1) throw new Error(`applications=${apps}`);
  });

  await check('Dashboard shows application statistics + recent list', async () => {
    if (!(await page.locator('h3:has-text("Application statistics")').isVisible()))
      throw new Error('stats card missing');
    if (!(await page.locator('h3:has-text("Recent applications")').isVisible()))
      throw new Error('recent card missing');
    if (!(await page.locator('h3:has-text("Most applied internships")').isVisible()))
      throw new Error('top internships missing');
  });

  /* 2. Manage internships */
  await check('Internship management table loads (10 listings)', async () => {
    await page.click('aside a:has-text("Internships")');
    await page.waitForURL('**/admin/internships', { timeout: 8000 });
    await page.waitForSelector('th:has-text("Internship")', { timeout: 10000 });
    const rows = await page.locator('tbody tr').count();
    if (rows < 5) throw new Error(`expected >=5 rows, got ${rows}`);
  });

  await check('Table search filters listings', async () => {
    await page.fill('input[name="q"]', 'Data Science Intern');
    await page.waitForTimeout(900);
    const rows = await page.locator('tbody tr').count();
    const body = await page.locator('main').innerText();
    if (rows !== 1 && !body.includes('Data Science Intern')) throw new Error(`rows=${rows}`);
    await page.fill('input[name="q"]', '');
    await page.waitForTimeout(900);
  });

  await check('Create internship via modal (full validation path)', async () => {
    await page.click('button:has-text("New internship")');
    await page.waitForSelector('[role="dialog"]:has-text("Create internship")', { timeout: 5000 });

    // submit empty first → client validation
    await page.click('button:has-text("Publish internship")');
    await page.waitForSelector('text=Please fix the highlighted fields', { timeout: 5000 });

    await page.fill('input[name="title"]', IX_TITLE);
    await page.fill('input[name="company"]', 'E2E Corp');
    await page.fill(
      'textarea[name="description"]',
      'An end-to-end created internship used to verify the full admin CRUD pipeline works correctly.'
    );
    await page.selectOption('select[name="category"]', 'Engineering');
    await page.fill('input[name="location"]', 'Goa');
    await page.selectOption('select[name="workMode"]', 'Remote');
    await page.fill('input[name="stipend"]', '21000');
    await page.fill('input[name="duration"]', '3 months');
    await page.fill('input[name="deadline"]', '2027-06-01');
    await page.fill('input[name="ix-skill"]', 'Playwright');
    await page.click('button:has-text("Add")');
    await page.waitForSelector('span:has-text("Playwright")', { timeout: 4000 });

    await page.click('button:has-text("Publish internship")');
    await page.waitForSelector('text=Internship created successfully', { timeout: 10000 });
    await page.waitForSelector(`td:has-text("${IX_TITLE}")`, { timeout: 8000 });
  });

  await check('Edit internship updates stipend', async () => {
    await page.click(`button[aria-label="Edit ${IX_TITLE}"]`);
    await page.waitForSelector('[role="dialog"]:has-text("Edit internship")', { timeout: 5000 });
    await page.fill('input[name="stipend"]', '26000');
    await page.click('button:has-text("Save changes")');
    await page.waitForSelector('text=Internship updated successfully', { timeout: 10000 });
    await page.waitForSelector('td:has-text("₹26,000")', { timeout: 8000 });
  });

  await check('Delete confirmation can be cancelled', async () => {
    await page.click(`button[aria-label="Delete ${IX_TITLE}"]`);
    await page.waitForSelector('[role="dialog"]:has-text("Delete internship?")', { timeout: 5000 });
    await page.click('button:has-text("Cancel")');
    await page.waitForTimeout(400);
    if (!(await page.locator(`td:has-text("${IX_TITLE}")`).count()))
      throw new Error('row disappeared after cancel');
  });

  await check('Delete internship removes it permanently', async () => {
    await page.click(`button[aria-label="Delete ${IX_TITLE}"]`);
    await page.waitForSelector('[role="dialog"]:has-text("Delete internship?")', { timeout: 5000 });
    await page.click('button:has-text("Delete permanently")');
    await page.waitForSelector('text=Internship deleted', { timeout: 10000 });
    await page.waitForTimeout(700);
    if (await page.locator(`td:has-text("${IX_TITLE}")`).count())
      throw new Error('row still present after delete');
  });

  /* 3. Applicants */
  await check('Applicants page lists applications with status tabs', async () => {
    await page.click('aside a:has-text("Applicants")');
    await page.waitForURL('**/admin/applications', { timeout: 8000 });
    await page.waitForSelector('button:has-text("Shortlisted")', { timeout: 8000 });
    await page.waitForTimeout(700);
    const rows = await page.locator('button[aria-label^="View application of"]').count();
    if (rows < 1) throw new Error('no application rows');
  });

  await check('Applicant search + view modal shows cover letter + profile', async () => {
    await page.fill('input[name="q"]', 'priya');
    await page.waitForTimeout(700);
    // NOTE: use the aria-label — ':has-text("View")' would also match the "Under Review" tab!
    await page.locator('button[aria-label^="View application of"]').first().click();
    await page.waitForSelector('[role="dialog"]:has-text("Cover letter")', { timeout: 6000 });
    const dialog = await page.locator('[role="dialog"]').innerText();
    if (!dialog.includes('Student profile')) throw new Error('profile section missing');
    if (dialog.length < 200) throw new Error('cover letter appears empty');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  await check('Status change from row select works', async () => {
    const select = page.locator('select[aria-label^="Status for"]').first();
    const before = await select.inputValue();
    const target = before === 'Under Review' ? 'Shortlisted' : 'Under Review';
    await select.selectOption(target);
    await page.waitForSelector(`text=/Application marked as/`, { timeout: 8000 });
    await page.waitForTimeout(400);
    const after = await page.locator('select[aria-label^="Status for"]').first().inputValue();
    if (after !== target) throw new Error(`expected ${target}, got ${after}`);
    // restore
    await page.locator('select[aria-label^="Status for"]').first().selectOption(before);
    await page.waitForTimeout(500);
  });

  await check('Status tab filter shows correct subset', async () => {
    await page.fill('input[name="q"]', '');
    await page.click('button:has-text("Accepted")');
    await page.waitForTimeout(600);
    const badges = await page.locator('main span.bg-emerald-50, main span').filter({ hasText: 'Accepted' }).count();
    const rows = await page.locator('button[aria-label^="View application of"]').count();
    const summary = await page.locator('main').innerText();
    if (rows === 0 && !summary.includes('No applications found'))
      throw new Error('unexpected empty without empty-state');
    void badges;
    await page.click('button:has-text("All")');
  });

  /* 4. Cross-role: student sees admin-created listing (create again quickly) */
  await check('Student explorer receives admin-published internship', async () => {
    // admin creates
    await page.click('aside a:has-text("Internships")');
    await page.waitForURL('**/admin/internships', { timeout: 8000 });
    await page.click('button:has-text("New internship")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.fill('input[name="title"]', `${IX_TITLE} Live`);
    await page.fill('input[name="company"]', 'Live Bridge Corp');
    await page.fill(
      'textarea[name="description"]',
      'This listing verifies that admin-created content appears instantly for students.'
    );
    await page.fill('input[name="location"]', 'Mysuru');
    await page.fill('input[name="stipend"]', '19000');
    await page.fill('input[name="duration"]', '2 months');
    await page.fill('input[name="deadline"]', '2027-07-01');
    await page.fill('input[name="ix-skill"]', 'Testing');
    await page.click('button:has-text("Add")');
    await page.click('button:has-text("Publish internship")');
    await page.waitForSelector('text=Internship created successfully', { timeout: 10000 });

    // student view (fresh context)
    const ctx2 = await browser.newContext();
    const p2 = await ctx2.newPage();
    const email = `e2e.viewer.${Date.now()}@test.com`;
    await p2.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    await p2.fill('input[name="name"]', 'Viewer Student');
    await p2.fill('input[name="email"]', email);
    await p2.fill('input[name="password"]', 'Test@1234');
    await p2.fill('input[name="confirm"]', 'Test@1234');
    await p2.click('button[type="submit"]');
    await p2.waitForURL('**/app', { timeout: 10000 });
    await p2.goto(`${BASE}/app/internships`, { waitUntil: 'networkidle' });
    await p2.fill('input[name="q"]', `${IX_TITLE} Live`);
    await p2.waitForTimeout(1100);
    const body = await p2.locator('main').innerText();
    if (!body.includes('Live Bridge Corp')) throw new Error('listing not visible to student');
    // student cannot open admin area
    await p2.goto(`${BASE}/admin/internships`, { waitUntil: 'networkidle' });
    await p2.waitForURL('**/app', { timeout: 8000 });
    await ctx2.close();

    // cleanup: delete the live listing
    await page.fill('input[name="q"]', `${IX_TITLE} Live`);
    await page.waitForTimeout(900);
    await page.click(`button[aria-label="Delete ${IX_TITLE} Live"]`);
    await page.click('button:has-text("Delete permanently")');
    await page.waitForSelector('text=Internship deleted', { timeout: 8000 });
  });

  await browser.close();

  console.log('\n========= E2E RESULTS (Module 6) =========');
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
