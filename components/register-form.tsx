"use client";

import React, { useEffect, useActionState } from "react";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerPpdbAction } from "@/app/actions/auth";

export function RegisterForm({
  className,
  onSwitchToLogin,
  ...props
}: React.ComponentProps<"form"> & { onSwitchToLogin?: () => void }) {
  const [state, action, isPending] = useActionState(registerPpdbAction, {
    success: false,
  });

  useEffect(() => {
    if (state?.success && state.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state?.success, state?.redirectTo]);

  const errorMessage = state?.error;

  return (
    <form
      action={action}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Daftar PPDB</h1>
        <p className="text-xs text-muted-foreground">
          Buat akun baru untuk mendaftar sebagai peserta PPDB
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Nama lengkap Anda"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            name="email"
            type="email"
            placeholder="email@example.com"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
          />
          <p className="text-xs text-muted-foreground">
            Minimal 8 karakter
          </p>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 font-semibold"
        >
          {isPending ? "Mendaftar..." : "Daftar Akun PPDB"}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            atau
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full font-semibold"
        onClick={() => signIn("google", { callbackUrl: "/dashboard-ppdb/dashboard" })}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Daftar dengan Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="underline underline-offset-4 hover:text-primary"
        >
          Login di sini
        </button>
      </p>
    </form>
  );
}
