import { chromium, FullConfig } from "@playwright/test";

const UN = process.env.NEXT_PUBLIC_DISCORD_ALT_UN as string;
const PW = process.env.NEXT_PUBLIC_DISCORD_ALT_PW as string;

/**
 * This file/config does remedy the slowness running auth before each test case where it
 * is needed, it does however not deal with the potential CAPTCHA faced upon auth
 */
async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/");
  const loginBtn = page.locator("main").getByRole("link").getByText("Login");
  await loginBtn.click();
  const useDisc = page.getByText("Sign in with Discord");
  await useDisc.click();
  await page.getByLabel("Email or Phone Number*").fill(UN);
  await page.getByLabel("Password*").fill(PW);
  await page.getByRole("button", { name: "Log In" }).click();
  // after this step you may or may not be greeted by some sort of captcha
  await page.getByRole("button", { name: "Authorize" }).click();
  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({ path: "storageState.json" });
  await browser.close();
}

export default globalSetup;
