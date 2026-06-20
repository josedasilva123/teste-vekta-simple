import type { TextareaHTMLAttributes } from 'react'

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function TextArea({ className = '', ...props }: TextAreaProps) {
  return (
    <textarea
      className={`w-full resize-none rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-white outline-none transition focus:border-accent ${className}`}
      {...props}
    />
  )
}
