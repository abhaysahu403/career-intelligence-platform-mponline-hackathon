import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-bold text-slate-600 dark:text-slate-400"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full rounded-xl border px-4 py-3 text-sm font-bold placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:border-sky focus:ring-2 focus:ring-sky/20 ${
          error ? 'border-red-400 dark:border-red-500/50 focus:border-red-400 focus:ring-red-400/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-bold text-red-500">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';
export default Input;
