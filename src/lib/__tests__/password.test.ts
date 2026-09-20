import { describe, expect, it } from "vitest";
import {
  hashPassword,
  verifyPassword,
} from "@/lib/password";

describe("password hashing (bcryptjs)", () => {
  it("round-trips a password", async () => {
    const hash = await hashPassword("S3cret!Pass");
    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(hash).not.toContain("S3cret!Pass");
    await expect(verifyPassword("S3cret!Pass", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-pass", hash)).resolves.toBe(false);
  });

  it("produces a unique salt each call", async () => {
    const a = await hashPassword("same-pass");
    const b = await hashPassword("same-pass");
    expect(a).not.toBe(b);
  });

  it("rejects a mangled hash gracefully", async () => {
    await expect(verifyPassword("x", "not-a-hash")).resolves.toBe(false);
  });
});
