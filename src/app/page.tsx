import Link from "next/link";
import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 flex w-full max-w-5xl flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Secure Supply Chain Inventory
        </h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          A type-safe, audit-ready inventory management system built with
          Next.js, Prisma, and Zod — featuring role-based access control, an
          immutable audit trail, and a full DevSecOps pipeline.
        </p>
        <div className="flex gap-4">
          {session?.user ? (
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "default" })}
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "default" })}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={buttonVariants({ variant: "outline" })}
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}