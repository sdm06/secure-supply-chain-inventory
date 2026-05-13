import { auth } from "@/auth";
import { db } from "@/lib/db";
import { InventoryTable } from "@/components/inventory-table";
import { AddItemDialog } from "@/components/add-item-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const items = await db.inventoryItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your secure supply chain inventory.
          </p>
        </div>
        <AddItemDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        {/* Add more stats here */}
      </div>

      <InventoryTable items={items} isAdmin={isAdmin} />
    </div>
  );
}
