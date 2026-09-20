import { test, expect, type Page } from "@playwright/test";

const ADMIN = { email: "admin@example.com", password: "Admin123!" };
const USER = { email: "user@example.com", password: "User123!" };

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("anonymous visitors are redirected to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("admin sees inventory controls and the audit trail", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);
  await expect(page.getByRole("heading", { name: "Inventory", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Item" })).toBeVisible();
  await expect(page.getByText("Recent Activity")).toBeVisible();
});

test("standard user gets a read-only, controls-free view", async ({ page }) => {
  await login(page, USER.email, USER.password);
  await expect(page.getByRole("heading", { name: "Inventory", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Item" })).toHaveCount(0);
  await expect(page.getByText("Recent Activity")).toHaveCount(0);
});
