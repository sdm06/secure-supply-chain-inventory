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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteInventoryItem } from "@/actions/inventory";
import { useState, useTransition } from "react";
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
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const onConfirmDelete = () => {
    if (!itemToDelete) return;
    setDeleteError(null);

    startTransition(async () => {
      try {
        await deleteInventoryItem(itemToDelete.id);
        setItemToDelete(null);
      } catch (error) {
        setDeleteError(
          error instanceof Error ? error.message : "Failed to delete item",
        );
      }
    });
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
                      onClick={() => {
                        setDeleteError(null);
                        setItemToDelete(item);
                      }}
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

      <Dialog
        open={itemToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete item?</DialogTitle>
            <DialogDescription>
              {itemToDelete && (
                <>
                  Delete <span className="font-medium">{itemToDelete.name}</span>{" "}
                  ({itemToDelete.sku})? This action is permanent and will be
                  recorded in the audit log.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p
              className="text-sm text-destructive"
              role="alert"
              aria-live="polite"
            >
              {deleteError}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setItemToDelete(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}