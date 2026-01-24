"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const dashboardPath =
    user.role === "admin"
      ? "/admin/dashboard"
      : user.role === "worker"
        ? "/worker/dashboard"
        : "/client/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href={dashboardPath} className="text-xl font-bold">
            Nimmit
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <NavLink
              href={dashboardPath}
              active={pathname.includes("/dashboard")}
            >
              Dashboard
            </NavLink>
            {user.role === "client" && (
              <NavLink
                href="/client/brief"
                active={pathname === "/client/brief"}
              >
                New Brief
              </NavLink>
            )}
            {user.role !== "admin" && (
              <NavLink
                href={`/${user.role}/jobs`}
                active={pathname.includes("/jobs") && !pathname.includes("/brief")}
              >
                Jobs
              </NavLink>
            )}
            {user.role === "admin" && (
              <>
                <NavLink href="/admin/jobs" active={pathname === "/admin/jobs"}>
                  All Jobs
                </NavLink>
                <NavLink
                  href="/admin/team"
                  active={pathname === "/admin/team"}
                >
                  Team
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${user.role}/settings`}>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-primary ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
