import { test, expect, request } from '@playwright/test';
import { baseUrl, baseApi } from "./config"

const baseConfig = {
  "project_name": "kinto",
  "project_version": "1",
  "http_api_version": "1.22",
  "project_docs": "https://kinto.readthedocs.io/",
  "url": baseApi,
  "settings": {
    "batch_max_requests": 25,
    "readonly": false,
    "explicit_permissions": true
  },
  "capabilities": {
    "default_bucket": {
      "description": "The default bucket is an alias for a personal bucket where collections are created implicitly.",
      "url": "https://kinto.readthedocs.io/en/latest/api/1.x/buckets.html#personal-bucket-default"
    },
    "admin": {
      "description": "Serves the admin console.",
      "url": "https://github.com/Kinto/kinto-admin/",
      "version": "0.0.0-dev"
    },
    "accounts": {
      "description": "Manage user accounts.",
      "url": "https://kinto.readthedocs.io/en/latest/api/1.x/accounts.html",
      "validation_enabled": false
    },
    "permissions_endpoint": {
      "description": "The permissions endpoint can be used to list all user objects permissions.",
      "url": "https://kinto.readthedocs.io/en/latest/configuration/settings.html#activating-the-permissions-endpoint"
    }
  }
};

test('Login page loads and user logs in successfully', async ({ page }) => {
  // mock API response for get server info
  await page.route(`${baseApi}`, async route => {
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
      json: {
        ...baseConfig,
        user: {
          id: "user",
          principals: ["account:user"]
        }
      }
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
  await page.route(`${baseApi}`, async route => {
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
