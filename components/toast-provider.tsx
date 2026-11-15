"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import SwipeToast from "@/components/SwipeToast";

export type ToastType = "info" | "success" | "warning" | "error";

type ToastOptions = {
  id?: string;
  duration?: number;
  onClose?: () => void;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
};

type ToastRecord = {
  id: string;
  instance: number;
  message: string;
  type: ToastType;
  duration: number;
  onClose?: () => void;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
};

type ToastContextValue = {
  showToast: (
    message: string,
    type?: ToastType,
    options?: ToastOptions,
  ) => string;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastAppearance = {
  info: {
    title: "Informasi",
    icon: <Info aria-hidden="true" />,
    background: "#132b6d",
    fuseColor: "#93c5fd",
    duration: 5000,
  },
  success: {
    title: "Berhasil",
    icon: <CircleCheck aria-hidden="true" />,
    background: "#14532d",
    fuseColor: "#86efac",
    duration: 4500,
  },
  warning: {
    title: "Perlu diperiksa",
    icon: <TriangleAlert aria-hidden="true" />,
    background: "#78350f",
    fuseColor: "#fcd34d",
    duration: 8000,
  },
  error: {
    title: "Gagal",
    icon: <CircleAlert aria-hidden="true" />,
    background: "#7f1d1d",
    fuseColor: "#fca5a5",
    duration: 8000,
  },
} satisfies Record<
  ToastType,
  {
    title: string;
    icon: ReactNode;
    background: string;
    fuseColor: string;
    duration: number;
  }
>;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);
  const nextInstance = useRef(0);

  const showToast = useCallback<ToastContextValue["showToast"]>(
    (message, type = "success", options = {}) => {
      const id = options.id ?? `toast-${++nextId.current}`;
      const appearance = toastAppearance[type];
      const toast: ToastRecord = {
        id,
        instance: ++nextInstance.current,
        message,
        type,
        duration: options.duration ?? appearance.duration,
        onClose: options.onClose,
        actionLabel: options.actionLabel,
        onAction: options.onAction,
      };

      setToasts((current) =>
        [...current.filter((item) => item.id !== id), toast].slice(-3),
      );
      return id;
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="toast-viewport"
        role="region"
        aria-label="Notifikasi"
        aria-live="off"
      >
        {toasts.map((toast) => {
          const appearance = toastAppearance[toast.type];

          return (
            <SwipeToast
              key={`${toast.id}-${toast.instance}`}
              title={appearance.title}
              description={toast.message}
              icon={appearance.icon}
              background={appearance.background}
              color="#ffffff"
              fuseColor={appearance.fuseColor}
              role={toast.type === "error" ? "alert" : "status"}
              ariaLive={toast.type === "error" ? "assertive" : "polite"}
              duration={toast.duration}
              actionLabel={toast.actionLabel}
              onAction={toast.onAction}
              closeButton
              inline
              onClose={() => {
                setToasts((current) => current.filter((item) => item.id !== toast.id));
                toast.onClose?.();
              }}
            />
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider.");
  }

  return context;
}
