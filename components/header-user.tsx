"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Trash2, UserRound } from "lucide-react";

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
  onDeleteAccount,
  isDeletingAccount,
}: {
  user: {
    name: string;
    email: string;
  };
  onDeleteAccount: () => Promise<void>;
  isDeletingAccount: boolean;
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
        <button className="rounded-lg transition hover:bg-slate-100 p-1">
          <Avatar className="h-9 w-9 rounded-lg">
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-lg" align="end" sideOffset={8}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">
            <UserRound className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut || isDeletingAccount}
        >
          <LogOut className="size-4" />
          {isSigningOut ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void onDeleteAccount()}
          disabled={isSigningOut || isDeletingAccount}
          variant="destructive"
        >
          <Trash2 className="size-4" />
          {isDeletingAccount ? "Deleting account..." : "Delete Account"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
