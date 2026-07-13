import { Bot, User, Quote } from "lucide-react"
import type { ChatMessage } from "@/types"
import { cn } from "@/lib/utils"

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            pct >= 90 ? "bg-success" : pct >= 75 ? "bg-primary" : "bg-warning",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
    </div>
  )
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      <div className={cn("flex max-w-2xl flex-col gap-2", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border border-border bg-card text-card-foreground",
          )}
        >
          <p className="whitespace-pre-wrap text-pretty">{message.content}</p>
        </div>

        {message.citations && message.citations.length > 0 && (
          <div className="w-full space-y-2 rounded-xl border border-border bg-muted/40 p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Quote className="size-3.5" />
              Sources &amp; Citations
            </p>
            <ul className="space-y-2">
              {message.citations.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{c.documentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.reference} &middot; Page {c.page}
                    </p>
                  </div>
                  <ConfidenceBar value={c.confidence} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
