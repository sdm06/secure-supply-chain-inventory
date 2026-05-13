import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold">Secure Supply Chain Inventory</h1>
        <p className="text-xl text-center">
          A type-safe, role-based inventory management system built with Next.js, Prisma, and Zod.
        </p>
        <div className="flex gap-4">
          <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
