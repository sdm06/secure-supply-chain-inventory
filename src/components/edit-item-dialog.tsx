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
import { updateInventoryItem } from "@/actions/inventory";
import { Pencil } from "lucide-react";
import { type InventoryStatus } from "@/schemas/inventory";
import type { InventoryItem } from "@prisma/client";

const STATUS_OPTIONS: { value: InventoryStatus; label: string }[] = [
  { value: "IN_STOCK", label: "In stock" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
  { value: "PENDING", label: "Pending" },
];

export function EditItemDialog({ item }: { item: InventoryItem }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<InventoryStatus>(
    item.status as InventoryStatus,
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      quantity: parseInt(formData.get("quantity") as string, 10),
      location: (formData.get("location") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      status,
    };

    startTransition(async () => {
      try {
        await updateInventoryItem(item.id, data);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update item");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon-sm" aria-label={`Edit ${item.name}`}>
            <Pencil />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {item.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={item.name} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              defaultValue={item.quantity}
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
            <Input id="location" name="location" defaultValue={item.location ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              defaultValue={item.description ?? ""}
              placeholder="Optional details"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}