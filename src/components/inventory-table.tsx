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

interface InventoryTableProps {
  items: any[];
  isAdmin: boolean;
}

export function InventoryTable({ items, isAdmin }: InventoryTableProps) {
  const [isPending, startTransition] = useTransition();

  const onDelete = (id: string) => {
    if (confirm("Are you sure?")) {
      startTransition(async () => {
        try {
          await deleteInventoryItem(id);
        } catch (error: any) {
          alert(error.message);
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
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.location}</TableCell>
              {isAdmin && (
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(item.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={isAdmin ? 6 : 5} className="text-center">
                No items found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
