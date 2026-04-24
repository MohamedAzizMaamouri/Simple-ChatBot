import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils'; // we'll create this below

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2',
        variant === 'primary' && 'bg-primary text-dark hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'ghost' && 'border border-dark-700 text-white hover:border-primary/50 hover:text-primary',
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
}