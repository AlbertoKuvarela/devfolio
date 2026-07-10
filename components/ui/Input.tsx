import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full bg-surface border border-border-2 px-4 py-3 text-sm text-white outline-none focus:border-lime placeholder:text-muted ${className}`}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={`w-full bg-surface border border-border-2 px-4 py-3 text-sm text-white outline-none focus:border-lime placeholder:text-muted ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-mono text-muted mb-2">{children}</label>;
}
