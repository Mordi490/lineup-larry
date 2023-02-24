import { test, expect } from "@playwright/test";

const UUID = process.env.TEST_USER_UUID as string;
const UN = process.env.NEXT_PUBLIC_DISCORD_ALT_UN as string;
const PW = process.env.NEXT_PUBLIC_DISCORD_ALT_PW as string;

// NB! slow
// Consider approaches that reuse the state.
test.beforeEach(async ({ page }) => {
  /*
  const context = await browser.newContext({
    storageState: "./storageState.json",
  });
  const page = await context.newPage();
  */
  await page.goto("http://localhost:3000/");

  // works iff no captcha
  const loginBtn = page.locator("main").getByRole("link").getByText("Login");
  await loginBtn.click();
  const useDisc = page.getByText("Sign in with Discord");
  await useDisc.click();
  await page.getByLabel("Email or Phone Number*").fill(UN);
  await page.getByLabel("Password*").fill(PW);
  await page.getByRole("button", { name: "Log In" }).click();
  // after this step you may or may not be greeted by some sort of captcha
  await page.getByRole("button", { name: "Authorize" }).click();
  await expect(page).toHaveURL("http://localhost:3000/");
});

test('Check the "your lineups" page', async ({ page }) => {
  // expect to be signed in
  await page.goto("http://localhost:3000/");
  await page.getByRole("button", { name: "Discord profile picture" }).click();

  await page.getByRole("link", { name: "Your Lineups" }).click();
  await expect(page).toHaveURL(`http://localhost:3000/${UUID}/lineups`);

  // We expect
  await expect(page).toHaveURL(`http://localhost:3000/${UUID}/lineups`);

  // expect some elements
  const numOfLineups = page.getByText("Number of lineups:");
  const highestRated = page.getByText("Highest rated lineups");
});

test("CRUD-ops on lineup", async ({ page }) => {
  await page.goto("http://localhost:3000/create");
  // fill out the form
  await page.getByPlaceholder("Lineup Title").fill("Playwright test lineup");
  await page.locator('select[name="agent"]').selectOption("Omen");
  await page.locator('select[name="map"]').selectOption("Icebox");
  await page
    .getByPlaceholder("a few words about the lineup")
    .fill("This is a test lineup from automated Playwright tests");
  await page.locator('input[name="image"]').click();

  await page.locator('input[name="image"]').setInputFiles("test_image.webp");

  await page.getByRole("button", { name: "Submit" }).click();
  // expect to be redirect to specific lineup page
  await expect(page).toHaveURL(/.*lineup/);

  // edit the lineup
  await page.getByRole("link", { name: "Edit" }).click();

  await page
    .getByPlaceholder("Playwright test lineup")
    .fill('"Test from Playwright", but edited');

  await page
    .getByPlaceholder("Supplement text")
    .fill("This is test from Playwright, but edited");

  await page.locator('input[name="image"]').setInputFiles("test_image.webp");

  await page.getByRole("button", { name: "Submit" }).click();
  // expect to be redirect to specific lineup page
  await expect(page).toHaveURL(/.*lineup/);
  // delete the lineup
  await page.getByText("Delete").click();

  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page).toHaveURL("http://localhost:3000/lineups");
});

test("View profile test", async ({ page }) => {
  await page.goto(`http://localhost:3000/user/${UUID}`);
  // TODO: flesh out the page more and add sensible tests
  await page.getByText("Data we have about your user:");
});

// logout test
test.afterAll(async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("button", { name: "Discord profile picture" }).click();
  await page.getByRole("link", { name: "Logout" }).click();
  await expect(page).toHaveURL("http://localhost:3000/api/auth/signout");

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("http://localhost:3000/");
});
