import { PrismaClient, type Prisma } from "@prisma/client";
import { hashPassword } from "./password";

const db = new PrismaClient();

async function main() {
  const adminPassword = await hashPassword("Admin123!");
  const userPassword = await hashPassword("User123!");

  const admin = await db.user.upsert({
    where: { email: "admin@example.com" },
    update: { password: adminPassword },
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const user = await db.user.upsert({
    where: { email: "user@example.com" },
    update: { password: userPassword },
    create: {
      email: "user@example.com",
      name: "Regular User",
      password: userPassword,
      role: "USER",
    },
  });

  const items: Prisma.InventoryItemCreateInput[] = [
    {
      name: "Steel Bolts M8",
      description: "Galvanized steel bolts, 100-pack boxes",
      quantity: 240,
      sku: "BRC-0001",
      location: "Warehouse A",
      status: "IN_STOCK",
    },
    {
      name: "Hydraulic Filter",
      description: "Replacement hydraulic fluid filters",
      quantity: 0,
      sku: "FLT-0117",
      location: "Warehouse A",
      status: "OUT_OF_STOCK",
    },
    {
      name: "Industrial Gloves",
      description: "Cut-resistant nitrile coated gloves, L",
      quantity: 6,
      sku: "GLV-0345",
      location: "Warehouse B",
      status: "IN_STOCK",
    },
    {
      name: "Polymer Seals Kit",
      description: "Seal kits for P-200 pumps",
      quantity: 18,
      sku: "SEL-0888",
      location: "Warehouse C",
      status: "PENDING",
    },
    {
      name: "Torque Wrench 1/2",
      description: "Calibrated torque wrench with certificate",
      quantity: 3,
      sku: "TQL-1200",
      location: "Tools Bay",
      status: "IN_STOCK",
    },
  ];

  for (const item of items) {
    await db.inventoryItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: item,
    });
  }

  console.log({ admin, user, seededItems: items.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });