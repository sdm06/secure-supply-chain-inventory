import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { InventoryTable } from "@/components/inventory-table";
import { AddItemDialog } from "@/components/add-item-dialog";
import { SignOutButton } from "@/components/sign-out-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Boxes, PackageMinus, PackageX, ShieldCheck } from "lucide-react";
import { AuditLogTable } from "@/components/audit-log-table";

const LOW_STOCK_THRESHOLD = 10;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";

  const [items, recentAuditLogs] = await Promise.all([
    db.inventoryItem.findMany({ orderBy: { createdAt: "desc" } }),
    isAdmin
      ? db.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : Promise.resolve([]),
  ]);

  const totalItems = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const outOfStock = items.filter(
    (item) => item.status === "OUT_OF_STOCK" || item.quantity === 0,
  ).length;
  const lowStock = items.filter(
    (item) => item.quantity > 0 && item.quantity <= LOW_STOCK_THRESHOLD,
  ).length;

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your secure supply chain inventory.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {session.user.name ?? session.user.email}
            <span className="ml-1">
              {isAdmin ? (
                <span className="inline-flex items-center text-primary">
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Admin
                </span>
              ) : (
                " · Viewer"
              )}
            </span>
          </span>
          <SignOutButton />
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <PackageX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <PackageMinus className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{lowStock}</div>
            <p className="text-xs text-muted-foreground">
              {LOW_STOCK_THRESHOLD} units or fewer
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          Inventory Items
        </h2>
        {isAdmin && <AddItemDialog />}
      </div>

      <InventoryTable items={items} isAdmin={isAdmin} />

      {isAdmin && (
        <div className="mt-8">
          <AuditLogTable logs={recentAuditLogs} />
        </div>
      )}
    </div>
  );
}