"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import Silk from "@/components/Silk";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const [currentMode, setCurrentMode] = useState<"login" | "register">(
    mode === "register" ? "register" : "login"
  );

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start"></div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Memuat...</div>}>
              {currentMode === "login" ? (
                <LoginForm onSwitchToRegister={() => setCurrentMode("register")} />
              ) : (
                <RegisterForm onSwitchToLogin={() => setCurrentMode("login")} />
              )}
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Silk
          speed={5}
          scale={1}
          color="#0022ff"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginPageContent />
    </Suspense>
  );
}
