"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md animate-scale-in shadow-lg border-[var(--nimmit-border)]">
      <CardHeader className="space-y-2 text-center pb-2">
        {/* Logo/Brand */}
        <div className="mx-auto mb-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--nimmit-accent-primary)] flex items-center justify-center">
            <span className="text-white font-bold text-xl font-display">N</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-display tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription className="text-[var(--nimmit-text-secondary)]">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 pt-4">
          {/* Error Alert */}
          {error && (
            <div className="rounded-lg bg-[var(--nimmit-error-bg)] border border-[var(--nimmit-error)]/20 p-4 animate-fade-in">
              <p className="text-sm text-[var(--nimmit-error)] font-medium flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-[var(--nimmit-text-primary)]"
            >
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="h-12 bg-[var(--nimmit-bg-secondary)] border-[var(--nimmit-border)] 
                         focus:border-[var(--nimmit-accent-primary)] focus:ring-[var(--nimmit-ring-color)]
                         placeholder:text-[var(--nimmit-text-tertiary)] transition-all duration-200"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-[var(--nimmit-error)] animate-fade-in">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-[var(--nimmit-text-primary)]"
              >
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-sm text-[var(--nimmit-accent-primary)] hover:text-[var(--nimmit-accent-primary-hover)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="h-12 bg-[var(--nimmit-bg-secondary)] border-[var(--nimmit-border)] 
                         focus:border-[var(--nimmit-accent-primary)] focus:ring-[var(--nimmit-ring-color)]
                         placeholder:text-[var(--nimmit-text-tertiary)] transition-all duration-200"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-[var(--nimmit-error)] animate-fade-in">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-6 pt-2">
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium bg-[var(--nimmit-accent-primary)] 
                       hover:bg-[var(--nimmit-accent-primary-hover)] text-white
                       shadow-sm hover:shadow-md transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>

          {/* Divider */}
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--nimmit-border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--nimmit-bg-elevated)] px-3 text-[var(--nimmit-text-tertiary)]">
                New to Nimmit?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            href="/register"
            className="w-full h-12 inline-flex items-center justify-center rounded-lg
                       border border-[var(--nimmit-border)] bg-[var(--nimmit-bg-elevated)]
                       text-[var(--nimmit-text-primary)] font-medium
                       hover:bg-[var(--nimmit-bg-secondary)] hover:border-[var(--nimmit-border-hover)]
                       transition-all duration-200"
          >
            Create an account
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-[var(--nimmit-border)] bg-[var(--nimmit-bg-elevated)] p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-xl skeleton" />
          <div className="h-7 w-40 skeleton rounded-lg" />
          <div className="h-5 w-56 skeleton rounded-lg" />
        </div>
        <div className="mt-8 space-y-5">
          <div className="space-y-2">
            <div className="h-4 w-24 skeleton rounded" />
            <div className="h-12 w-full skeleton rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 skeleton rounded" />
            <div className="h-12 w-full skeleton rounded-lg" />
          </div>
          <div className="h-12 w-full skeleton rounded-lg mt-6" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      {/* Subtle decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[var(--nimmit-accent-primary)]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[var(--nimmit-accent-tertiary)]/5 blur-3xl" />
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
