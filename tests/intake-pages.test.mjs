import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const routeCases = [
  {
    route: 'quote',
    endpoint: '/v1/intake/quotes',
    fields: ['fullName', 'email', 'projectSummary', 'consent', 'website'],
  },
  {
    route: 'pre-interest',
    endpoint: '/v1/intake/pre-interest',
    fields: ['fullName', 'email', 'interest', 'consent', 'website'],
  },
  {
    route: 'apply',
    endpoint: '/v1/intake/applications',
    fields: ['fullName', 'email', 'role', 'experienceSummary', 'consent', 'website'],
  },
];

const readRoute = (route) => {
  const file = path.join(distDir, route, 'index.html');
  assert.ok(existsSync(file), `expected built route ${file}`);
  return readFileSync(file, 'utf8');
};

test('get-started renders links to every public intake path', () => {
  const html = readRoute('get-started');
  for (const href of ['/quote/', '/pre-interest/', '/apply/']) {
    assert.ok(html.includes(`href="${href}"`), `expected get-started link ${href}`);
  }
  assert.ok(!html.includes('undefined'));
});

for (const routeCase of routeCases) {
  test(`${routeCase.route} renders the API contract and accessible controls`, () => {
    const html = readRoute(routeCase.route);
    assert.ok(html.includes('<form'), 'expected a form element');
    assert.ok(
      html.includes(`data-endpoint="${routeCase.endpoint}"`),
      `expected endpoint ${routeCase.endpoint}`,
    );
    for (const field of routeCase.fields) {
      assert.ok(html.includes(`name="${field}"`), `expected ${field} field`);
    }
    assert.ok(html.includes('role="status"'), 'expected an aria-live status region');
    assert.ok(html.includes('data-form-status'), 'expected form status hook');
    assert.ok(html.includes('data-intake-form'), 'expected intake form hook');
    assert.ok(!html.includes('undefined'), 'found an undefined template value');
    assert.ok(!/ghp_|lin_api_|sk-[A-Za-z0-9]/.test(html), 'found a credential-shaped value');
  });
}

test('built forms do not hard-code an unreviewed API hostname', () => {
  for (const routeCase of routeCases) {
    const html = readRoute(routeCase.route);
    assert.ok(!html.includes('api.claritas-viz.github.io'));
    assert.ok(!html.includes('api.claritas-viz.com'));
  }
});
