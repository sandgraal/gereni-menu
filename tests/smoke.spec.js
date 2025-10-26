import { test, expect } from '@playwright/test';

test('homepage loads without errors', async ({ page }) => {
  await page.goto('http://localhost:8080/index.html');
  await expect(page).toHaveTitle(/Gereni/i);
});

test('menu page renders items', async ({ page }) => {
  await page.goto('http://localhost:8080/menu.html');
  const items = await page.locator('li');
  await expect(items).not.toHaveCount(0);
});
