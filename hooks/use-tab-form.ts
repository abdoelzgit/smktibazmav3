'use client';

import { useCallback } from 'react';
import { useForm } from './form-context';
import type { TabName } from '@/lib/validations/ppdb-form';

interface UseTabSubmitOptions {
  action: (formData: FormData) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export function useTabSubmit(tab: TabName, options: UseTabSubmitOptions) {
  const { validateTab, getFormDataForSubmit, setSubmitting, setTabStatus } = useForm();

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateTab(tab)) {
      setTabStatus(tab, 'error');
      return;
    }

    setSubmitting(tab, true);
    setTabStatus(tab, 'saving');

    try {
      const formData = getFormDataForSubmit(tab);
      const result = await options.action(formData);
      
      if (result.success) {
        setTabStatus(tab, 'saved');
        options.onSuccess?.(result.data);
      } else {
        setTabStatus(tab, 'error');
        options.onError?.(result.error || 'Gagal menyimpan data');
      }
    } catch (err) {
      setTabStatus(tab, 'error');
      options.onError?.(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setSubmitting(tab, false);
    }
  }, [tab, validateTab, getFormDataForSubmit, setSubmitting, setTabStatus, options]);

  return { handleSubmit };
}

export function useTabValidation(tab: TabName) {
  const { validateTab, setError, clearError, setTouched, errors, touched } = useForm();

  const validateField = useCallback((field: string, value: unknown) => {
    // Field-level validation can be added here if needed
  }, []);

  const handleBlur = useCallback((field: string) => {
    setTouched(tab, field);
    validateTab(tab);
  }, [tab, setTouched, validateTab]);

  const handleChange = useCallback((field: string, value: unknown) => {
    clearError(tab, field);
  }, [tab, clearError]);

  return {
    errors: errors[tab] || {},
    touched: touched[tab] || {},
    handleBlur,
    handleChange,
    validateTab: () => validateTab(tab),
  };
}