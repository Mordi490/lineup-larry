import { test, expect } from "@playwright/test";

test("/lineup page contains multiple lineups", async ({ page }) => {
  await page.goto("http://localhost:3000/lineups");

  // Expect a select button to contain various filter options, "recent", "most liked", "oldest"
  await expect(page).toHaveTitle("Lineup Larry");

  const FilterSelect = page.locator("recent");

  // NB! fixing the select filter may make this easier
  //await FilterSelect.click();

  // Expect an attribute "to be strictly equal" to the value.
  //await expect(FilterSelect).toHaveValues(["recent", "most-likes", "oldest"]);
});
