"use client";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Button
        onClick={() => {
          redirect("/login");
        }}
      >
        Go to Login
      </Button>
    </div>
  );
}
