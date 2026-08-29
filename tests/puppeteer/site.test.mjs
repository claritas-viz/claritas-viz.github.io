import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import puppeteer from 'puppeteer';

const PRODUCT_NAME = 'Claritas';
const ORG_URL = 'https://github.com/claritas-viz';

const externalBaseUrl = process.env.E2E_BASE_URL;
const PREVIEW_PORT = 4322;
const baseUrl = externalBaseUrl ?? `http://127.0.0.1:${PREVIEW_PORT}`;

let child;
let browser;
let page;
let response;

function waitForPort(port, host, timeoutMs = 60_000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const attempt = () => {
      const socket = net.connect(port, host);
      socket.once('connect', () => {
        socket.end();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() > deadline) {
          reject(new Error(`preview server on port ${port} did not become ready`));
        } else {
          setTimeout(attempt, 250);
        }
      });
    };
    attempt();
  });
}

before(async () => {
  if (!externalBaseUrl) {
    child = spawn(
      'npm',
      ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PREVIEW_PORT)],
      { stdio: 'ignore' },
    );
    await waitForPort(PREVIEW_PORT, '127.0.0.1');
  }
  browser = await puppeteer.launch({
    args: process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [],
  });
  page = await browser.newPage();
  response = await page.goto(`${baseUrl}/`, { waitUntil: 'load' });
});

after(async () => {
  if (browser) await browser.close();
  if (child) child.kill();
});

test('page.goto succeeds', () => {
  assert.ok(response, 'expected a navigation response');
  assert.ok(
    response.ok() || response.status() === 304,
    `expected an ok (or 304) response, got ${response.status()}`,
  );
});

test('identifies the Claritas product', async () => {
  const title = await page.title();
  const brand = await page.$eval('.brand', (el) => el.textContent ?? '');
  assert.ok(title.includes(PRODUCT_NAME), `expected title to contain ${PRODUCT_NAME}`);
  assert.ok(brand.includes(PRODUCT_NAME), `expected brand to contain ${PRODUCT_NAME}`);
});

test('shows the analytics feature grid', async () => {
  const count = await page.$$eval('.features article', (items) => items.length);
  assert.ok(count >= 4, `expected at least four feature cards, got ${count}`);
});

test('page contains the GitHub org link', async () => {
  const hrefs = await page.$$eval('a', (anchors) => anchors.map((a) => a.getAttribute('href')));
  assert.ok(hrefs.includes(ORG_URL), `expected a link to ${ORG_URL}`);
});

test('integration selector is available', async () => {
  const value = await page.$eval('[aria-label="Select client language"]', (select) => select.value);
  assert.equal(value, 'sql');
});

test('language selector switches samples without console errors', async () => {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !/favicon/i.test(message.text())) {
      errors.push(message.text());
    }
  });
  await page.select('[aria-label="Select client language"]', 'typescript');
  const visible = await page.$eval('[data-sample="typescript"]', (el) => el.hidden);
  assert.equal(visible, false);
  const filename = await page.$eval('[data-filename]', (el) => el.textContent);
  assert.equal(filename, 'analysis.ts');
  assert.deepEqual(errors, []);
});
