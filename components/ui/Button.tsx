import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: 'bg-lime text-black hover:bg-white',
  secondary: 'bg-transparent border border-border-2 text-white hover:border-lime hover:text-lime',
  ghost: 'bg-transparent text-text-bright hover:text-white',
  danger: 'bg-coral text-white hover:opacity-90',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`px-5 py-2.5 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  )
);

Button.displayName = 'Button';
