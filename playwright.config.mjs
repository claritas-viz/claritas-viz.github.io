import { defineConfig, devices } from '@playwright/test';

const externalBaseURL = process.env.E2E_BASE_URL;
const localPort = Number(process.env.PLAYWRIGHT_PORT ?? 4372);
const baseURL = externalBaseURL ?? `http://127.0.0.1:${localPort}`;

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(externalBaseURL
    ? {}
    : {
        webServer: {
          command: `npm run preview -- --host 127.0.0.1 --port ${localPort}`,
          url: `http://127.0.0.1:${localPort}`,
          reuseExistingServer: false,
          timeout: 120000,
        },
      }),
});
