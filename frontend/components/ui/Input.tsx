import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm text-white/70 font-medium">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-lg bg-dark-800 border text-white placeholder-white/30 outline-none transition-all duration-200',
            error
              ? 'border-red-500 focus:border-red-400'
              : 'border-dark-700 focus:border-primary/60',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;