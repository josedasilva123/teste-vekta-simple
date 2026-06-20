import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Button } from '@/components/atoms/Button'
import { TextArea } from '@/components/atoms/TextArea'

type ChatInputProps = {
  onSend: (content: string) => boolean
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Envie uma mensagem...',
}: ChatInputProps) {
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    if (onSend(trimmed)) {
      setValue('')
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">
      <div className="relative rounded-2xl border border-border bg-surface-elevated shadow-lg">
        <TextArea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
          placeholder={placeholder}
          className="min-h-[52px] border-0 bg-transparent pr-14 focus:border-0"
        />
        <Button
          type="submit"
          disabled={disabled || !value.trim()}
          className="absolute bottom-2 right-2 size-9 rounded-lg px-0"
          aria-label="Enviar mensagem"
        >
          ↑
        </Button>
      </div>
      <p className="mt-2 hidden text-center text-xs text-muted sm:block">
        Enter envia · Shift+Enter quebra linha
      </p>
    </form>
  )
}
