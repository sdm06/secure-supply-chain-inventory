import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="font-heading text-lg font-semibold tracking-tight"
          >
            Secure Supply Chain
          </Link>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your inventory
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}