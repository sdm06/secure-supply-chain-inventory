"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { InventoryItemSchema } from "@/schemas/inventory";
import { revalidatePath } from "next/cache";

export async function createInventoryItem(data: any) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validatedData = InventoryItemSchema.parse(data);

  const item = await db.inventoryItem.create({
    data: validatedData,
  });

  revalidatePath("/dashboard");
  return item;
}

export async function updateInventoryItem(id: string, data: any) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validatedData = InventoryItemSchema.partial().parse(data);

  const item = await db.inventoryItem.update({
    where: { id },
    data: validatedData,
  });

  revalidatePath("/dashboard");
  return item;
}

export async function deleteInventoryItem(id: string) {
  const session = await auth();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  // RBAC: Only ADMIN can delete
  if (session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: You do not have permission.");
  }

  await db.inventoryItem.delete({
    where: { id },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
