"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/admin";
    }, 800);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">

        <h1 className="text-2xl font-bold tracking-tight">Login Admin</h1>
        <p className="text-xs text-muted-foreground">
          Masukkan username dan password Anda untuk masuk ke sistem
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Username / Email</Label>
          <Input
            id="username"
            type="text"
            placeholder="Masukkan username atau email"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 font-semibold"
        >
          {isLoading ? "Memproses..." : "Login"}
        </Button>
      </div>
    </form>
  );
}
