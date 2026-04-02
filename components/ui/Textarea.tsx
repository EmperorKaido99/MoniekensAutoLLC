import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-navy uppercase tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={3}
          className={[
            'w-full rounded-xl border bg-white px-4 py-3 text-base text-navy resize-none',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error ? 'border-danger' : 'border-gray-300',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-sm text-danger font-medium">{error}</p>}
        {hint && !error && <p className="text-sm text-muted">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
export default Textarea;
