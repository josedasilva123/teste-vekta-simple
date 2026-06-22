const DOT_DELAYS = ['0ms', '160ms', '320ms']

export function TypingIndicator() {
  return (
    <div className="flex gap-3 bg-[#2a2a2a]/40 px-3 py-4 sm:gap-4 sm:px-4 sm:py-6">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-[#5436da] text-xs font-semibold text-white sm:size-8">
        AI
      </div>
      <div className="flex items-center pt-0.5">
        <div className="flex items-center gap-1 rounded-2xl px-1 py-1">
          {DOT_DELAYS.map((delay) => (
            <span
              key={delay}
              className="block size-2 rounded-full bg-muted"
              style={{ animation: `typing-dot 1.2s ease-in-out infinite`, animationDelay: delay }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
