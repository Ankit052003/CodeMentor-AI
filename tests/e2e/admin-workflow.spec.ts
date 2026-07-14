import { test, expect } from "@playwright/test";

const ADMIN = { email: "admin@codementor.ai", password: "Password123!" };

test.describe("Admin Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill("#login-email", ADMIN.email);
    await page.fill("#login-password", ADMIN.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("admin dashboard loads with stats", async ({ page }) => {
    await page.click("text=Admin");
    await expect(page).toHaveURL(/\/dashboard\/admin/);
    await expect(page.locator("text=Platform control")).toBeVisible();
  });

  test("admin can view user management section", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page.locator("text=User management")).toBeVisible();
  });

  test("admin can view submission moderation", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page.locator("text=Submission moderation")).toBeVisible();
  });

  test("admin can view platform analytics", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page.locator("text=Platform analytics")).toBeVisible();
  });
});
