"use client";

import React, { useEffect, useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/app/actions/auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const reason = searchParams.get("reason");

  const [state, action, isPending] = useActionState(loginAction, {
    success: false,
  });

  useEffect(() => {
    if (state?.success) {
      window.location.href = callbackUrl;
    }
  }, [state?.success, callbackUrl]);

  const errorMessage =
    state?.error ||
    (!state?.success && state?.error === undefined && reason === "unauthorized"
      ? "Anda harus login untuk mengakses halaman admin."
      : reason === "session_expired"
      ? "Sesi Anda telah berakhir. Silakan login kembali."
      : null);

  return (
    <form
      action={action}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Login Admin</h1>
        <p className="text-xs text-muted-foreground">
          Masukkan username dan password Anda untuk masuk ke sistem
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Email</Label>
          <Input
            id="username"
            name="username"
            type="email"
            placeholder="admin@smktibazma.sch.id"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 font-semibold"
        >
          {isPending ? "Memproses..." : "Login"}
        </Button>
      </div>
    </form>
  );
}
