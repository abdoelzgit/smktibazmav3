'use client';

import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, helperText, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        <label htmlFor={inputId} className="block text-sm font-bold text-gray-800 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full border rounded-lg px-3 py-2 text-sm text-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            error
              ? 'border-red-400 bg-red-50'
              : 'border-gray-400 hover:border-gray-500',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, required, helperText, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        <label htmlFor={inputId} className="block text-sm font-bold text-gray-800 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full border rounded-lg px-3 py-2 text-sm text-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            error
              ? 'border-red-400 bg-red-50'
              : 'border-gray-400 hover:border-gray-500',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        <label htmlFor={selectId} className="block text-sm font-bold text-gray-800 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            error
              ? 'border-red-400 bg-red-50'
              : 'border-gray-400 hover:border-gray-500',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function FormCheckbox({ label, name, checked, onChange, error }: CheckboxProps) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name}
        id={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500"
        aria-invalid={error ? 'true' : 'false'}
      />
      <label htmlFor={name} className="text-sm text-gray-700 cursor-pointer">
        {label}
      </label>
      {error && <p className="ml-7 mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}

interface FileUploadProps {
  label: string;
  name: string;
  accept?: string;
  value?: string;
  onChange: (file: File | null) => void;
  error?: string;
  preview?: string;
  onRemovePreview?: () => void;
}

export function FormFileUpload({ label, name, accept, value, onChange, error, preview, onRemovePreview }: FileUploadProps) {
  const [fileName, setFileName] = React.useState<string | null>(value ? value.split('/').pop() || null : null);
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) setFileName(file.name);
    else setFileName(value ? value.split('/').pop() || null : null);
    onChange(file);
  };

  return (
    <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
      <label className="block text-sm font-bold text-gray-800 mb-2">
        {label}
      </label>
      <div className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
        <input
          name={name}
          type="file"
          accept={accept || '.pdf,image/*'}
          onChange={handleChange}
          className="w-full cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-900 hover:file:bg-blue-100"
          aria-invalid={error ? 'true' : 'false'}
        />
        {(fileName || preview) && (
          <div className="mt-2 flex items-center justify-between">
            <p className="truncate text-xs text-green-700 flex-1">
              File dipilih: {fileName || preview.split('/').pop()}
            </p>
            {onRemovePreview && (
              <button
                type="button"
                onClick={onRemovePreview}
                className="ml-2 text-xs text-red-600 hover:underline"
              >
                Hapus
              </button>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}