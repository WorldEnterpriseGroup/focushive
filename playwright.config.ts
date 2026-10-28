import { defineConfig, devices } from '@playwright/test';

// BASE_URL lets the same suite assert against the live site after deploy.
const baseURL = process.env.BASE_URL ?? 'http://localhost:4173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: { baseURL, trace: 'on-first-retry', screenshot: 'only-on-failure', headless: true },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'python3 -m http.server 4173', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI },
});
