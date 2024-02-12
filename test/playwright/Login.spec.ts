import { test, expect } from '@playwright/test';
import { baseUrl, baseApi, baseConfig, authenticatedConfig } from "./config"

test('Login page loads and user logs in successfully', async ({ page }) => {
  // mock API response for get server info
  await page.route(baseApi, async route => {
    await route.fulfill({
      json: baseConfig,
    });
  });

  // load login page
  await page.goto(baseUrl);
  await expect(page).toHaveTitle("Kinto Administration");

  // fill out user info
  await page.getByLabel("Kinto Account Auth").click();
  await page.getByLabel(/Username/).fill("user");
  await page.getByLabel(/Password/).fill("pass");

  // mock API response, including user object this time
  await page.route(`${baseApi}`, async route => {
    await route.fulfill({
      json: authenticatedConfig
    });
  });

  // login
  await page.getByText("Sign in using Kinto Account Auth").click()

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


test('Login page loads and user fails to login', async ({ page }) => {
  // mock API response
  await page.route(baseApi, async route => {
    await route.fulfill({
      json: baseConfig,
    });
  });

  // load login page
  await page.goto(baseUrl);
  await expect(page).toHaveTitle("Kinto Administration");

  // login
  await page.getByLabel("Kinto Account Auth").click();
  await page.getByLabel(/Username/).fill("user");
  await page.getByLabel(/Password/).fill("pass");
  await page.getByText("Sign in using Kinto Account Auth").click()

  // verify error notification shows up
  await expect(page.getByText(/Authentication failed/)).toBeVisible();
  await expect(page.getByText(/Could not authenticate/)).toBeVisible();

  // verify that we did not get forwarded to home page
  await expect(page.getByText("project_name")).toHaveCount(0);
  await expect(page.getByText("project_version")).toHaveCount(0);
  await expect(page.getByText("http_api_version")).toHaveCount(0);
});
