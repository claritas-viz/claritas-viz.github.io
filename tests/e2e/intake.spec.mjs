import { test, expect } from '@playwright/test';

const API_BASE = 'https://api.example.invalid';

const cases = [
  {
    pagePath: '/quote/',
    endpoint: '/v1/intake/quotes',
    submitName: 'Submit quote request',
    fields: {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      projectSummary: 'Build a deterministic analytics workbench.',
    },
  },
  {
    pagePath: '/pre-interest/',
    endpoint: '/v1/intake/pre-interest',
    submitName: 'Register interest',
    fields: {
      fullName: 'Grace Hopper',
      email: 'grace@example.com',
      interest: 'A private preview of the visualization search workflow.',
    },
  },
  {
    pagePath: '/apply/',
    endpoint: '/v1/intake/applications',
    submitName: 'Submit application',
    fields: {
      fullName: 'Margaret Hamilton',
      email: 'margaret@example.com',
      role: 'Platform engineer',
      experienceSummary: 'Built fault-tolerant systems with explicit operational contracts.',
    },
  },
];

for (const testCase of cases) {
  test(`${testCase.pagePath} submits the exact public intake contract`, async ({ page }) => {
    let captured;
    await page.route(`${API_BASE}${testCase.endpoint}`, async (route) => {
      const request = route.request();
      captured = {
        method: request.method(),
        headers: request.headers(),
        payload: request.postDataJSON(),
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          submissionId: `browser-${testCase.pagePath.replaceAll('/', '')}`,
          kind: 'test',
          status: 'accepted',
          receivedAtUnixMs: 1,
        }),
      });
    });

    await page.goto(testCase.pagePath);
    for (const [name, value] of Object.entries(testCase.fields)) {
      await page.locator(`[name="${name}"]`).fill(value);
    }
    await page.locator('[name="consent"]').check();
    await page.getByRole('button', { name: testCase.submitName }).click();

    await expect(page.locator('[data-form-status]')).toContainText('Submitted. Reference: browser-');
    expect(captured).toBeDefined();
    expect(captured.method).toBe('POST');
    expect(captured.headers['content-type']).toContain('application/json');
    expect(captured.headers['idempotency-key']).toMatch(/^web-[A-Za-z0-9-]{8,}$/);
    expect(captured.payload).toMatchObject({
      ...testCase.fields,
      consent: true,
      website: '',
    });
    await expect(page.getByRole('button', { name: testCase.submitName })).toBeEnabled();
    await expect(page.locator('[name="consent"]')).not.toBeChecked();
  });
}

test('an unchanged retry reuses its key and an edited payload rotates it', async ({ page }) => {
  const keys = [];
  const payloads = [];
  let requestNumber = 0;
  await page.route(`${API_BASE}/v1/intake/quotes`, async (route) => {
    requestNumber += 1;
    const request = route.request();
    keys.push(request.headers()['idempotency-key']);
    payloads.push(request.postDataJSON());
    await route.fulfill({
      status: requestNumber < 3 ? 503 : 201,
      contentType: 'application/json',
      body: JSON.stringify(
        requestNumber < 3
          ? { message: 'Temporary intake outage.' }
          : {
              submissionId: 'browser-retry-success',
              kind: 'quote',
              status: 'accepted',
              receivedAtUnixMs: 1,
            },
      ),
    });
  });

  await page.goto('/quote/');
  await page.locator('[name="fullName"]').fill('Retry Tester');
  await page.locator('[name="email"]').fill('retry@example.com');
  await page.locator('[name="projectSummary"]').fill('Original payload');
  await page.locator('[name="consent"]').check();
  const submit = page.getByRole('button', { name: 'Submit quote request' });

  await submit.click();
  await expect(page.locator('[data-form-status]')).toHaveText('Temporary intake outage.');
  await submit.click();
  await expect(page.locator('[data-form-status]')).toHaveText('Temporary intake outage.');

  await page.locator('[name="projectSummary"]').fill('Edited payload');
  await submit.click();
  await expect(page.locator('[data-form-status]')).toHaveText(
    'Submitted. Reference: browser-retry-success',
  );

  expect(keys).toHaveLength(3);
  expect(keys[0]).toBe(keys[1]);
  expect(keys[2]).not.toBe(keys[1]);
  expect(payloads[0]).toEqual(payloads[1]);
  expect(payloads[2].projectSummary).toBe('Edited payload');
});

test('form content is not written to browser console output', async ({ page }) => {
  const sentinel = 'PRIVATE-FORM-CONTENT-SENTINEL';
  const consoleMessages = [];
  page.on('console', (message) => consoleMessages.push(message.text()));
  await page.route(`${API_BASE}/v1/intake/pre-interest`, async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        submissionId: 'browser-no-log',
        kind: 'pre-interest',
        status: 'accepted',
        receivedAtUnixMs: 1,
      }),
    });
  });

  await page.goto('/pre-interest/');
  await page.locator('[name="fullName"]').fill('Privacy Tester');
  await page.locator('[name="email"]').fill('privacy@example.com');
  await page.locator('[name="interest"]').fill(sentinel);
  await page.locator('[name="consent"]').check();
  await page.getByRole('button', { name: 'Register interest' }).click();
  await expect(page.locator('[data-form-status]')).toContainText('browser-no-log');

  expect(consoleMessages.join('\n')).not.toContain(sentinel);
});
