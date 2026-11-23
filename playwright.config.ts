import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

const isCI = !!process.env.CI
// E2E_PORT lets tests run next to a running `pnpm dev` (which uses 3000).
const port = Number(process.env.E2E_PORT ?? 3000)
const baseURL = `http://localhost:${port}`
// Locally (Ubuntu 20.04) Playwright cannot install its own Chromium, so we use system Chrome.
const channel = isCI ? undefined : 'chrome'

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel, viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        channel,
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm start -p ${port}`,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
})
