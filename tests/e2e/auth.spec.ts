import { test, expect } from "@playwright/test";

const STUDENT = { email: "student@codementor.ai", password: "Password123!" };
const MENTOR = { email: "mentor@codementor.ai", password: "Password123!" };
const ADMIN = { email: "admin@codementor.ai", password: "Password123!" };

test.describe("Authentication", () => {
  test("login page loads and shows demo accounts", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Welcome to CodeMentor AI")).toBeVisible();
    await expect(page.locator("text=Student")).toBeVisible();
    await expect(page.locator("text=Mentor")).toBeVisible();
    await expect(page.locator("text=Admin")).toBeVisible();
  });

  test("student can log in and see dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#login-email", STUDENT.email);
    await page.fill("#login-password", STUDENT.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("text=Welcome to your learning hub")).toBeVisible();
  });

  test("mentor can log in and see mentor dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#login-email", MENTOR.email);
    await page.fill("#login-password", MENTOR.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("admin can log in and see admin dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#login-email", ADMIN.email);
    await page.fill("#login-password", ADMIN.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("root redirects to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });
});
