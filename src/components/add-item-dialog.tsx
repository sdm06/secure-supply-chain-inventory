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
import { createInventoryItem } from "@/actions/inventory";
import { PlusCircle } from "lucide-react";

export function AddItemDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      quantity: parseInt(formData.get("quantity") as string),
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      status: "IN_STOCK",
    };

    startTransition(async () => {
      try {
        await createInventoryItem(data);
        setOpen(false);
      } catch (error: any) {
        alert(error.message);
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
              defaultValue="0"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="Warehouse A" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Optional details" />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Adding..." : "Add Item"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
