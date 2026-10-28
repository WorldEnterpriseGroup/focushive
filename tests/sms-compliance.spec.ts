/**
 * sms-compliance.spec.ts: asserts the carrier / CTIA / TCPA compliance
 * elements required for the SignalWire 10DLC campaign
 * "Focus Hive Staff Business Messaging" are present on the site.
 * Set BASE_URL=https://focushive.com to run against the live site.
 */
import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LEGAL_NAME = 'Focus Hive Inc.';
const ADDRESS = '1041 N Dupont Hwy #1178, Dover, DE 19901';
const NO_SHARE =
  'No mobile information will be shared with third parties/affiliates for marketing/promotional purposes.';
const NO_SHARE_2 =
  'All other categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.';

const compliancePages = ['/privacy.html', '/terms.html', '/sms-terms.html', '/sms-privacy.html', '/sms-opt-in.html'];
const sitePages = [
  '/', '/aboutus.html', '/features.html', '/features_personal.html', 
  '/support.html', '/invitation.html', '/swarm/index.html', '/solution/business.html', '/solution/personal.html',
  '/thanks.html', '/404error.html',
  ...compliancePages,
];

test.describe('privacy policy', () => {
  test('is reachable and contains the carrier no-sharing statement', async ({ page }) => {
    const res = await page.goto('/privacy.html');
    expect(res?.status()).toBe(200);
    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(text).toContain(NO_SHARE);
    expect(text).toContain(NO_SHARE_2);
    expect(text).toContain(LEGAL_NAME);
    expect(text).toContain(ADDRESS);
    expect(text).toMatch(/never|do not sell/i);
  });

  test('sms privacy policy repeats the no-sharing statement', async ({ page }) => {
    await page.goto('/sms-privacy.html');
    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(text).toContain(NO_SHARE);
    expect(text).toContain(ADDRESS);
  });
});

test.describe('SMS terms', () => {
  test('state program, message types, frequency, rates, STOP, HELP, support, carriers', async ({ page }) => {
    await page.goto('/sms-terms.html');
    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(text).toContain('Focus Hive Staff Business Messaging');
    expect(text).toMatch(/message frequency/i);
    expect(text).toContain('Msg & data rates may apply');
    expect(text).toMatch(/reply\s+STOP/i);
    expect(text).toMatch(/reply\s+HELP/i);
    expect(text).toContain('info@focushive.com');
    expect(text).toContain('929-374-4853');
    expect(text).toMatch(/carriers[^.]*not liable/i);
    expect(text).toContain(ADDRESS);
    expect(text).toContain(NO_SHARE);
  });

  test('welcome message includes company, frequency, rates, STOP and HELP', async ({ page }) => {
    await page.goto('/sms-terms.html');
    const sample = (await page.locator('.sample').first().innerText()).replace(/\s+/g, ' ');
    expect(sample).toContain('Focus Hive');
    expect(sample).toMatch(/frequency varies/i);
    expect(sample).toContain('Msg & data rates may apply');
    expect(sample).toMatch(/STOP/);
    expect(sample).toMatch(/HELP/);
  });
});

test.describe('opt-in form', () => {
  const formPages = ['/sms-opt-in.html', '/support.html', '/invitation.html'];
  for (const url of formPages) {
    test(`${url}: SMS consent checkbox is unchecked, optional, and fully disclosed`, async ({ page }) => {
      await page.goto(url);
      const box = page.locator('input[type=checkbox][name=sms_consent]');
      await expect(box).toHaveCount(1);
      await expect(box).not.toBeChecked();
      expect(await box.getAttribute('required')).toBeNull();
      const label = (await box.locator('xpath=ancestor::label').innerText()).replace(/\s+/g, ' ');
      expect(label).toContain('Focus Hive Inc.');
      expect(label).toMatch(/optional/i);
      expect(label).toMatch(/not a condition of purchase/i);
      expect(label).toMatch(/frequency varies/i);
      expect(label).toContain('Msg & data rates may apply');
      expect(label).toMatch(/STOP/);
      expect(label).toMatch(/HELP/);
      await expect(box.locator('xpath=ancestor::label').getByRole('link', { name: 'SMS Terms' })).toHaveAttribute('href', '/sms-terms.html');
      await expect(box.locator('xpath=ancestor::label').getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy.html');
    });
  }

  test('every page with a phone field has an SMS consent checkbox', async ({ request }) => {
    for (const url of sitePages) {
      const res = await request.get(url);
      const html = await res.text();
      const hasPhone = /<input[^>]+(type=["']tel["']|name=["'](?:tel|phone)["'])/i.test(html);
      if (hasPhone) expect(html, `${url} collects a phone number`).toContain('name="sms_consent"');
    }
  });
});

test.describe('site-wide footer and content', () => {
  for (const url of sitePages) {
    test(`${url} links privacy policy, terms and SMS terms`, async ({ page }) => {
      const res = await page.goto(url);
      expect(res?.status()).toBeLessThan(400);
      for (const href of ['/privacy.html', '/terms.html', '/sms-terms.html']) {
        await expect(page.locator(`a[href="${href}"]`).first(), `${url} -> ${href}`).toBeAttached();
      }
      await expect(page.locator('body')).toContainText(LEGAL_NAME);
    });
  }

  test('no placeholder or under-construction content on published pages', async ({ request }) => {
    for (const url of sitePages) {
      const html = (await (await request.get(url)).text()).replace(/<script[\s\S]*?<\/script>/gi, '');
      expect(html, url).not.toMatch(/coming soon|under construction|lorem ipsum|maintenance mode|Tao Fruit LLC/i);
    }
  });

  test('legacy placeholder pages are gone', async ({ request }) => {
    for (const url of ['/comingsoon.html', '/maintenance.html', '/test.html', '/cart.html', '/ourservices.html']) {
      expect((await request.get(url)).status(), url).toBe(404);
    }
  });

  test('contact details match the registered brand', async ({ page }) => {
    await page.goto('/support.html');
    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(text).toContain(ADDRESS);
    expect(text).toContain('929-374-4853');
    expect(text).not.toMatch(/Cupterino|877-253-6287|Hong Kong|Moscow/);
  });
});

test.describe('repository hygiene', () => {
  test('no remaining internal links to removed pages', () => {
    const walk = (d: string): string[] =>
      readdirSync(d).flatMap((n) => {
        if (['node_modules', '.git', 'tests', '.claude', '.vs', 'playwright-report', 'test-results'].includes(n)) return [];
        const p = join(d, n);
        return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
      });
    for (const f of walk('.')) {
      const html = readFileSync(f, 'utf8');
      expect(html, f).not.toMatch(/href="(?:\/)?(?:comingsoon|maintenance)\.html"/);
    }
  });
});
