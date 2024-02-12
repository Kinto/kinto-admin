import { test, expect } from '@playwright/test';
import { baseUrl, baseConfig, baseApi, authenticatedConfig, authenticatedStorageStage } from "./config"

test.use({
  storageState: authenticatedStorageStage,
});

test('Home page loads if user is already authenticated', async ({ page, context }) => {
  // mock API response for get server info
  await page.route(baseApi, async route => {
    await route.fulfill({
      json: authenticatedConfig,
    });
  });

  // load home page
  await page.goto(baseUrl);

  console.log('test2', await page.evaluate(() => JSON.stringify(localStorage)));
  
  // verify succesful login causes home page to load
  await expect(page.getByText("project_name").locator(".."))
    .toContainText(`project_name${baseConfig.project_name}`, {
      ignoreCase: true
    });
  await expect(page.getByText("project_version").locator(".."))
    .toContainText(`project_version${baseConfig.project_version}`);
  await expect(page.getByText("http_api_version").locator(".."))
    .toContainText(`http_api_version${baseConfig.http_api_version}`);
});


