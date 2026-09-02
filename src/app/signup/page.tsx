import { AuthForm, AuthLayout } from "@/src/app/components/auth-form";
import { Suspense } from "react";

export const metadata = {
  title: "Create Account | Lamees",
  description: "Create a Lamees account to track orders and save your wishlist.",
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<AuthFormSkeleton />}>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthLayout>
  );
}

function AuthFormSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-9 w-56 animate-pulse rounded bg-muted" />
      <div className="h-11 w-full animate-pulse rounded bg-muted" />
      <div className="h-11 w-full animate-pulse rounded bg-muted" />
      <div className="h-11 w-full animate-pulse rounded bg-muted" />
      <div className="h-11 w-full animate-pulse rounded-full bg-muted" />
    </div>
  );
}
