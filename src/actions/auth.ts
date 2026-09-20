"use server";

import { signOut } from "@/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { redirect } from "next/navigation";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export type RegisterState = { error?: string } | undefined;

export async function registerUser(
  prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      role: "USER",
    },
  });

  redirect("/login?registered=1");
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}