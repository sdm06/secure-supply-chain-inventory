import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";

describe("seed database (offline SQLite)", () => {
  it("has exactly the two seeded demo users with distinct roles", async () => {
    const users = await db.user.findMany({ select: { email: true, role: true } });
    const admins = users.filter((u) => u.role === "ADMIN");
    const viewers = users.filter((u) => u.role === "USER");
    expect(admins).toHaveLength(1);
    expect(viewers).toHaveLength(1);
  });

  it("ships with seeded inventory items", async () => {
    const count = await db.inventoryItem.count();
    expect(count).toBeGreaterThan(0);
  });

  it("stores bcrypt hashes, never plaintext passwords", async () => {
    const users = await db.user.findMany({ select: { password: true } });
    for (const u of users) {
      expect(u.password).toMatch(/^\$2[aby]\$/);
    }
  });
});
