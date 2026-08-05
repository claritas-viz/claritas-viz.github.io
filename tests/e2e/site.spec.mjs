import { test, expect } from '@playwright/test';

const PRODUCT_NAME = 'Claritas';
const ORG_URL = 'https://github.com/claritas-viz';

test('page loads with a successful response', async ({ page }) => {
  const response = await page.goto('/');
  expect(response).not.toBeNull();
  expect(response.status()).toBeLessThan(400);
});

test('identifies the Claritas product', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(new RegExp(PRODUCT_NAME, 'i'));
  await expect(page.locator('.brand')).toContainText(PRODUCT_NAME);
});

test('shows the analytics feature grid', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.features article');
  expect(await cards.count()).toBeGreaterThanOrEqual(4);
  await expect(cards.first()).toBeVisible();
  await expect(cards.nth(3)).toBeVisible();
});

test('links to the GitHub organization', async ({ page }) => {
  await page.goto('/');
  const orgLinks = page.locator(`a[href="${ORG_URL}"]`);
  expect(await orgLinks.count()).toBeGreaterThanOrEqual(1);
  await expect(orgLinks.first()).toHaveAttribute('href', ORG_URL);
});

test('exposes the integration language selector', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Select client language')).toBeVisible();
  await expect(page.getByLabel('Select client language')).toHaveValue('sql');
});

test('no console errors during load', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !/favicon/i.test(message.text())) {
      errors.push(message.text());
    }
  });
  await page.goto('/', { waitUntil: 'load' });
  expect(errors).toEqual([]);
});
