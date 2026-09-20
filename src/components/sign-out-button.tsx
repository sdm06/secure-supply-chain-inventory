"use client";

import { useTransition } from "react";
import { logout } from "@/actions/auth";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}