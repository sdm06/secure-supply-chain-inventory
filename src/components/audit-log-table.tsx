import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@prisma/client";

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  UPDATE: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  DELETE: "bg-destructive/10 text-destructive",
};

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  const metadataKeys = (metadata: string | null) => {
    if (!metadata) return "—";
    try {
      const parsed = JSON.parse(metadata) as Record<string, unknown>;
      return Object.keys(parsed).join(", ");
    } catch {
      return "—";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Audit trail of inventory changes (last 10 entries).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        ACTION_STYLES[log.action] ?? "bg-muted text-muted-foreground",
                      )}
                    >
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{log.itemName ?? "—"}</TableCell>
                  <TableCell>{log.actorEmail ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {metadataKeys(log.metadata)}
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(log.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No activity recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}