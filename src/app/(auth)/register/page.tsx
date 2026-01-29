"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "client",
      timezone: "America/Los_Angeles",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || "Registration failed");
        return;
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      {/* Subtle decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[var(--nimmit-accent-primary)]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[var(--nimmit-accent-tertiary)]/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-lg animate-scale-in shadow-lg border-[var(--nimmit-border)]">
        <CardHeader className="space-y-2 text-center pb-2">
          {/* Logo/Brand */}
          <div className="mx-auto mb-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--nimmit-accent-primary)] flex items-center justify-center">
              <span className="text-white font-bold text-xl font-display">N</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-display tracking-tight">
            Create your account
          </CardTitle>
          <CardDescription className="text-[var(--nimmit-text-secondary)]">
            Join Nimmit to get your tasks done overnight
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

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-[var(--nimmit-text-primary)]"
                >
                  First name
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  autoComplete="given-name"
                  className="h-12 bg-[var(--nimmit-bg-secondary)] border-[var(--nimmit-border)] 
                             focus:border-[var(--nimmit-accent-primary)] focus:ring-[var(--nimmit-ring-color)]
                             placeholder:text-[var(--nimmit-text-tertiary)] transition-all duration-200"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-sm text-[var(--nimmit-error)] animate-fade-in">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-[var(--nimmit-text-primary)]"
                >
                  Last name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  autoComplete="family-name"
                  className="h-12 bg-[var(--nimmit-bg-secondary)] border-[var(--nimmit-border)] 
                             focus:border-[var(--nimmit-accent-primary)] focus:ring-[var(--nimmit-ring-color)]
                             placeholder:text-[var(--nimmit-text-tertiary)] transition-all duration-200"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-sm text-[var(--nimmit-error)] animate-fade-in">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

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
              <Label
                htmlFor="password"
                className="text-sm font-medium text-[var(--nimmit-text-primary)]"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
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

            {/* Role Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-sm font-medium text-[var(--nimmit-text-primary)]"
              >
                I am a...
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setValue("role", value as "client" | "worker" | "admin")
                }
              >
                <SelectTrigger className="h-12 bg-[var(--nimmit-bg-secondary)] border-[var(--nimmit-border)] 
                                          focus:border-[var(--nimmit-accent-primary)] focus:ring-[var(--nimmit-ring-color)]">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--nimmit-bg-elevated)] border-[var(--nimmit-border)]">
                  <SelectItem value="client" className="cursor-pointer hover:bg-[var(--nimmit-bg-secondary)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--nimmit-accent-primary)]/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[var(--nimmit-accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Client</p>
                        <p className="text-xs text-[var(--nimmit-text-tertiary)]">I need tasks done</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="worker" className="cursor-pointer hover:bg-[var(--nimmit-bg-secondary)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--nimmit-accent-tertiary)]/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[var(--nimmit-accent-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Worker</p>
                        <p className="text-xs text-[var(--nimmit-text-tertiary)]">KOOMPI team member</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-[var(--nimmit-error)] animate-fade-in">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Company Field (Client only) */}
            {selectedRole === "client" && (
              <div className="space-y-2 animate-fade-in">
                <Label
                  htmlFor="company"
                  className="text-sm font-medium text-[var(--nimmit-text-primary)]"
                >
                  Company <span className="text-[var(--nimmit-text-tertiary)]">(optional)</span>
                </Label>
                <Input
                  id="company"
                  placeholder="Your company name"
                  className="h-12 bg-[var(--nimmit-bg-secondary)] border-[var(--nimmit-border)] 
                             focus:border-[var(--nimmit-accent-primary)] focus:ring-[var(--nimmit-ring-color)]
                             placeholder:text-[var(--nimmit-text-tertiary)] transition-all duration-200"
                  {...register("company")}
                />
              </div>
            )}
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
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </Button>

            {/* Terms */}
            <p className="text-xs text-center text-[var(--nimmit-text-tertiary)] px-4">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-[var(--nimmit-accent-primary)] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[var(--nimmit-accent-primary)] hover:underline">
                Privacy Policy
              </Link>
            </p>

            {/* Divider */}
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--nimmit-border)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[var(--nimmit-bg-elevated)] px-3 text-[var(--nimmit-text-tertiary)]">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <Link
              href="/login"
              className="w-full h-12 inline-flex items-center justify-center rounded-lg
                         border border-[var(--nimmit-border)] bg-[var(--nimmit-bg-elevated)]
                         text-[var(--nimmit-text-primary)] font-medium
                         hover:bg-[var(--nimmit-bg-secondary)] hover:border-[var(--nimmit-border-hover)]
                         transition-all duration-200"
            >
              Sign in
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
