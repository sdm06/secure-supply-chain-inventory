"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { deleteInventoryItem } from "@/actions/inventory";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { InventoryItem } from "@prisma/client";
import { StatusBadge } from "@/components/status-badge";
import { EditItemDialog } from "@/components/edit-item-dialog";

interface InventoryTableProps {
  items: InventoryItem[];
  isAdmin: boolean;
}

export function InventoryTable({ items, isAdmin }: InventoryTableProps) {
  const [isPending, startTransition] = useTransition();

  const onDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This action is permanent and will be recorded in the audit log.`)) {
      startTransition(async () => {
        try {
          await deleteInventoryItem(id);
        } catch (error) {
          alert(error instanceof Error ? error.message : "Failed to delete item");
        }
      });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.sku}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell className="max-w-xs truncate whitespace-nowrap">
                {item.description || "—"}
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell>{item.location || "—"}</TableCell>
              {isAdmin && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <EditItemDialog item={item} />
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      aria-label={`Delete ${item.name}`}
                      onClick={() => onDelete(item.id, item.name)}
                      disabled={isPending}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={isAdmin ? 7 : 6} className="text-center">
                No items found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}