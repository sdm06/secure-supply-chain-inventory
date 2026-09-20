"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { InventoryItemSchema, type InventoryItemInput } from "@/schemas/inventory";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden: only admins can manage inventory");
  }
  return session.user;
}

async function recordAudit(entry: {
  action: "CREATE" | "UPDATE" | "DELETE";
  itemId: string;
  itemName: string;
  actorId: string;
  actorEmail: string | null;
  metadata?: string;
}) {
  await db.auditLog.create({
    data: {
      action: entry.action,
      itemId: entry.itemId,
      itemName: entry.itemName,
      actorId: entry.actorId,
      actorEmail: entry.actorEmail,
      metadata: entry.metadata,
    },
  });
}

export async function createInventoryItem(data: InventoryItemInput) {
  const user = await requireAdmin();

  const validatedData = InventoryItemSchema.parse(data);

  const item = await db.inventoryItem.create({
    data: validatedData,
  });

  await recordAudit({
    action: "CREATE",
    itemId: item.id,
    itemName: item.name,
    actorId: user.id,
    actorEmail: user.email ?? null,
    metadata: JSON.stringify({
      sku: item.sku,
      quantity: item.quantity,
      location: item.location,
      status: item.status,
    }),
  });

  revalidatePath("/dashboard");
  return item;
}

export async function updateInventoryItem(
  id: string,
  data: Partial<InventoryItemInput>,
) {
  const user = await requireAdmin();

  const validatedData = InventoryItemSchema.partial().parse(data);

  const existing = await db.inventoryItem.findUnique({ where: { id } });
  if (!existing) throw new Error("Item not found");

  const item = await db.inventoryItem.update({
    where: { id },
    data: validatedData,
  });

  const changes: Record<string, { before: unknown; after: unknown }> = {};
  for (const key of Object.keys(validatedData) as (keyof typeof validatedData)[]) {
    const before = existing[key];
    const after = validatedData[key];
    if (before !== after) changes[key] = { before, after };
  }

  await recordAudit({
    action: "UPDATE",
    itemId: item.id,
    itemName: item.name,
    actorId: user.id,
    actorEmail: user.email ?? null,
    metadata: Object.keys(changes).length > 0 ? JSON.stringify(changes) : undefined,
  });

  revalidatePath("/dashboard");
  return item;
}

export async function deleteInventoryItem(id: string) {
  const user = await requireAdmin();

  const existing = await db.inventoryItem.findUnique({ where: { id } });
  if (!existing) throw new Error("Item not found");

  await db.inventoryItem.delete({
    where: { id },
  });

  await recordAudit({
    action: "DELETE",
    itemId: existing.id,
    itemName: existing.name,
    actorId: user.id,
    actorEmail: user.email ?? null,
    metadata: JSON.stringify({
      sku: existing.sku,
      quantity: existing.quantity,
      status: existing.status,
    }),
  });

  revalidatePath("/dashboard");
  return { success: true };
}