"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, PencilLine, UserRound } from "lucide-react";

import { logOutUser } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HeaderUser({
  user,
}: {
  user: {
    name: string;
    email: string;
  };
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const initials = useMemo(() => {
    const source = user.name || user.email;
    return source.slice(0, 2).toUpperCase();
  }, [user.email, user.name]);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await logOutUser();
      router.replace("/login");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-2xl p-1.5 transition duration-200 ease-out hover:scale-105 hover:bg-sky-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200">
          <Avatar className="h-10 w-10 rounded-2xl shadow-sm">
            <AvatarFallback className="rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-sm font-semibold text-white shadow-md">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg duration-150 ease-out data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95"
        align="end"
        sideOffset={10}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-left text-sm">
            <Avatar className="h-10 w-10 rounded-2xl shadow-sm">
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-sm font-semibold text-white shadow-md">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-slate-900">{user.name}</span>
              <span className="truncate text-xs text-slate-500">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
          <Link href="/dashboard/profile" className="cursor-pointer">
            <UserRound className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
          <Link href="/dashboard/profile?edit=1" className="cursor-pointer">
            <PencilLine className="size-4" />
            Edit Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="rounded-xl px-3 py-2.5"
        >
          <LogOut className="size-4" />
          {isSigningOut ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
