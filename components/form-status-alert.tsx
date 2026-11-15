"use client";

import { useEffect, useId, useRef } from "react";
import { useToast, type ToastType } from "@/components/toast-provider";

type FormStatusAlertProps = {
  message: string
  type: ToastType
  onDismiss: () => void
}

export function FormStatusAlert({ message, type, onDismiss }: FormStatusAlertProps) {
  const { showToast } = useToast();
  const toastId = useId();
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    showToast(message, type, {
      id: `form-status-${toastId}`,
      onClose: () => onDismissRef.current(),
    });
  }, [message, showToast, toastId, type]);

  return null;
}
