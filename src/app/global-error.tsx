"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-full antialiased">
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ maxWidth: "24rem", width: "100%", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "2rem", textAlign: "center", background: "#fff" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              A critical error occurred
            </h2>
            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#6b7280" }}>
              Please reload the page to continue.
            </p>
            {error.digest && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#6b7280" }}>
                Reference: {error.digest}
              </p>
            )}
            <div style={{ marginTop: "1.5rem" }}>
              <Button onClick={reset}>Reload page</Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}