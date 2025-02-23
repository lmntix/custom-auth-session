"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";

import ThemeToggle from "@/components/theme/theme-toggle";

export function SiteHeader() {
  const session = "test";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex items-center justify-between h-16 px-4 md:px-16">
        <Link href="/" className=" items-center flex">
          <Image src="/logo.svg" alt="" width={32} height={32} />
          <span className="ml-2 text-lg font-bold  hidden sm:flex">
            Pocket Finance
          </span>
        </Link>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {session ? (
            <>
              <Link href="/organizations">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
