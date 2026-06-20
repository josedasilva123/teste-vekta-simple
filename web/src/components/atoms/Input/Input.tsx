import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-white outline-none transition focus:border-accent ${className}`}
      {...props}
    />
  )
}
