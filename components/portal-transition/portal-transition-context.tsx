"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface PortalTransitionContextType {
  isTransitioning: boolean;
  navigateTo: (href: string, label: string) => Promise<void>;
  registerTransition: (fn: (href: string, label: string) => Promise<void>) => void;
}

const PortalTransitionContext = createContext<PortalTransitionContextType>({
  isTransitioning: false,
  navigateTo: async () => {},
  registerTransition: () => {},
});

export function PortalTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionHandlerRef = useRef<
    ((href: string, label: string) => Promise<void>) | null
  >(null);
  const router = useRouter();

  const registerTransition = useCallback(
    (fn: (href: string, label: string) => Promise<void>) => {
      transitionHandlerRef.current = fn;
    },
    []
  );

  const navigateTo = useCallback(
    async (href: string, label: string) => {
      if (isTransitioning) return;

      // Handle smooth scroll untuk anchor link (#section)
      if (href.startsWith("#")) {
        const target = document.querySelector(href);
        if (target) {
          const headerOffset = 88;
          const targetTop =
            target.getBoundingClientRect().top + window.scrollY - headerOffset;
          window.scrollTo({ top: targetTop, behavior: "smooth" });
        }
        return;
      }

      // Jalankan animasi transisi portal jika terdaftar
      if (transitionHandlerRef.current) {
        setIsTransitioning(true);
        try {
          await transitionHandlerRef.current(href, label);
        } finally {
          setIsTransitioning(false);
        }
      } else {
        router.push(href);
      }
    },
    [isTransitioning, router]
  );

  return (
    <PortalTransitionContext.Provider
      value={{
        isTransitioning,
        navigateTo,
        registerTransition,
      }}
    >
      {children}
    </PortalTransitionContext.Provider>
  );
}

export function usePortalTransition() {
  return useContext(PortalTransitionContext);
}
