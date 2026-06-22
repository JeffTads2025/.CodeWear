import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'https://codewear.local',
    headless: false,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 15000,
    ignoreHTTPSErrors: true,
    // video: 'retain-on-failure',
    // trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: false,
        // CORREÇÃO AQUI: 'launch' mudou para 'launchOptions' e entrou no bloco 'use'
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--host-resolver-rules=MAP codewear.local 127.0.0.1',
          ],
        },
      },
    },
  ],
});