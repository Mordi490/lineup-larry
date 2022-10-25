import { test, expect } from "@playwright/test";

test("Homepage Title & button links to '/lineups'", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Lineup Larry");
  // create a locator
  const getStarted = page.getByText("View lineups");
  // Expect an attribute "to be strictly equal" to the value.
  await expect(getStarted).toHaveAttribute("href", "/lineups");
  // Click the get started link.
  await getStarted.click();
  // Expects the URL to contain "lineups".
  await expect(page).toHaveURL(/.*lineups/);
});

test("Homepage has a button that links to '/create'", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByText("Submit lineup").click();
  await expect(page).toHaveURL("http://localhost:3000/create");
});

test("Homepage has a button that links to '/api/auth/signin'", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/");
  const loginBtn = await page
    .locator("main")
    .getByRole("link")
    .getByText("Login");
  await expect(loginBtn).toHaveAttribute("href", "/api/auth/signin");
  await loginBtn.click();
  // Expects the URL to contain "create".s
  await expect(page).toHaveURL("http://localhost:3000/api/auth/signin");
  const discordBtn = page.getByText("Sign in with Discord");
  await expect(discordBtn).toBeEnabled();
});

test("Homepage has a button that links to '/api/auth/signout'", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/");
  const logoutBtn = page.locator("main").getByRole("link").getByText("Logout");
  await expect(logoutBtn).toHaveAttribute("href", "/api/auth/signout");
  await logoutBtn.click();
  // Expects the URL to contain "create".s
  await expect(page).toHaveURL("http://localhost:3000/api/auth/signout");
  const signOutBtn = page.getByRole("button");
  await expect(signOutBtn).toBeEnabled();
});
