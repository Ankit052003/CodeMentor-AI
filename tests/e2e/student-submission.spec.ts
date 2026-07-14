import { test, expect } from "@playwright/test";

const STUDENT = { email: "student@codementor.ai", password: "Password123!" };

test.describe("Student Submission Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill("#login-email", STUDENT.email);
    await page.fill("#login-password", STUDENT.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("submissions page shows existing submissions", async ({ page }) => {
    await page.click("text=Submissions");
    await expect(page).toHaveURL(/\/dashboard\/submissions/);
    await expect(page.locator("text=Your submissions")).toBeVisible();
  });

  test("can navigate to new submission page", async ({ page }) => {
    await page.click("text=New submission");
    await expect(page).toHaveURL(/\/dashboard\/submissions\/new/);
  });

  test("dashboard shows stats cards", async ({ page }) => {
    await expect(page.locator("text=Recent submissions")).toBeVisible();
    await expect(page.locator("text=Average review score")).toBeVisible();
    await expect(page.locator("text=Open improvement items")).toBeVisible();
    await expect(page.locator("text=Progress trend")).toBeVisible();
  });

  test("can view a submission detail", async ({ page }) => {
    await page.goto("/dashboard/submissions");
    const firstLink = page.locator("a[href*='/dashboard/submissions/']").first();
    if (await firstLink.isVisible()) {
      await firstLink.click();
      await expect(page).toHaveURL(/\/dashboard\/submissions\/(?!new)/);
    }
  });
});
