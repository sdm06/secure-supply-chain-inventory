import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";

const SKU = `TST-${Date.now()}`;

describe("delete audit trail (regression: P2003 FK violation)", () => {
  it("can record a DELETE audit after the item is removed", async () => {
    const item = await db.inventoryItem.create({
      data: {
        name: "Delete Flow Test Item",
        sku: SKU,
        quantity: 3,
        status: "IN_STOCK",
      },
    });

    await db.auditLog.create({
      data: {
        action: "CREATE",
        itemId: item.id,
        itemName: item.name,
        metadata: JSON.stringify({ sku: item.sku, quantity: item.quantity }),
      },
    });

    const auditBeforeDelete = await db.auditLog.count({ where: { itemId: item.id } });
    expect(auditBeforeDelete).toBe(1);

    await db.inventoryItem.delete({ where: { id: item.id } });

    const log = await db.auditLog.create({
      data: {
        action: "DELETE",
        itemId: null,
        itemName: "Delete Flow Test Item",
        metadata: JSON.stringify({ sku: item.sku, quantity: item.quantity, status: "IN_STOCK" }),
      },
    });

    expect(log).toMatchObject({
      action: "DELETE",
      itemId: null,
      itemName: "Delete Flow Test Item",
    });

    await db.auditLog.deleteMany({
      where: { itemName: "Delete Flow Test Item" },
    });
  });

  it("rejects an audit row that references a deleted item (the old P2003)", async () => {
    const item = await db.inventoryItem.create({
      data: {
        name: "Ghost Item",
        sku: `${SKU}-ghost`,
        quantity: 1,
        status: "IN_STOCK",
      },
    });

    await db.inventoryItem.delete({ where: { id: item.id } });

    await expect(
      db.auditLog.create({
        data: {
          action: "DELETE",
          itemId: item.id,
          itemName: item.name,
        },
      }),
    ).rejects.toMatchObject({ code: "P2003" });
  });
});