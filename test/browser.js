import { expect } from "chai";
import webdriver from "selenium-webdriver";
import { until, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox";

const SERVER_URL = "https://demo.kinto-storage.org/v1";
const BASE_URL = "http://localhost:3000";
const CREDENTIALS = ["admin", "s3cr3t"];

describe("HomePage", () => {
  let driver;

  beforeAll(async () => {
    const options = new firefox.Options();
    options.headless();

    const capabilities = {
      logLevel: "debug",
    };

    driver = new webdriver.Builder()
      .withCapabilities(capabilities)
      .forBrowser("firefox")
      .setFirefoxOptions(options)
      .build();

    driver.manage().setTimeouts({ implicit: 30000 });

    await driver.get(BASE_URL);
  }, 60000);

  afterAll(async () => {
    await driver.quit();
  }, 60000);

  test("Login", async () => {
    const header = await driver.findElement(By.css(".content div > h1"));
    expect(await header.getText()).to.contain("Administration");

    // Select server
    const rootServer = await driver.findElement(By.id("root_server"));
    rootServer.clear();
    rootServer.sendKeys(SERVER_URL);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Wait for authentication type radio buttons.
    await driver.findElement(By.css("label[for='root_authType']"));

    // Select Kinto Accounts.
    const radio = await driver.findElement(By.css("input[value='accounts']"));
    radio.click();

    // Authentication form gets refreshed. Wait again. TODO: fix?
    await driver.findElement(By.css("label[for='root_authType']"));

    // Fill username and password.
    const userField = await driver.findElement(
      By.id("root_credentials_username")
    );
    userField.sendKeys(CREDENTIALS[0]);

    const userPass = await driver.findElement(
      By.id("root_credentials_password")
    );
    userPass.sendKeys(CREDENTIALS[1]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Login
    const submit = await driver.findElement(By.css("button[type='submit']"));
    submit.click();

    // Wait for server info to be loaded.
    await driver.findElement(By.css(".server-info-panel"));

    // Wait for buckets list to be loaded.
    await driver.findElement(By.css(".bucket-menu"));

    // // Navigate to simple review page (uses React Hooks and broke a few times)
    // const reviewUrl =
    //   BASE_URL + "#/buckets/main/collections/articles/simple-review";
    // await driver.get(reviewUrl);

    // const message = await driver.findElement(
    //   By.css(".simple-review-blocked-message")
    // );
    // expect(message.is_displayed()).to.be.true;
  }, 60000);
});
