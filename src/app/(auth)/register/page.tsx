import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";
import { buttonVariants } from "@/components/ui/button";

export default async function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Register to get read-only access to the inventory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className={buttonVariants({ variant: "link", className: "p-0 h-auto" })}
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}