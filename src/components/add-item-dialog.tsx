"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInventoryItem } from "@/actions/inventory";
import { PlusCircle } from "lucide-react";
import { type InventoryStatus } from "@/schemas/inventory";

const STATUS_OPTIONS: { value: InventoryStatus; label: string }[] = [
  { value: "IN_STOCK", label: "In stock" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
  { value: "PENDING", label: "Pending" },
];

export function AddItemDialog() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<InventoryStatus>("IN_STOCK");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const quantity = Number(formData.get("quantity"));
    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Quantity must be a non-negative integer");
      return;
    }

    const data = {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      quantity,
      location: (formData.get("location") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      status,
    };

    startTransition(async () => {
      try {
        await createInventoryItem(data);
        setStatus("IN_STOCK");
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add item");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" placeholder="ABC-123" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Item Name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              step="1"
              defaultValue="0"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value ?? "IN_STOCK")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full">
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="Warehouse A" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Optional details" />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert" aria-live="polite">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Adding..." : "Add Item"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}