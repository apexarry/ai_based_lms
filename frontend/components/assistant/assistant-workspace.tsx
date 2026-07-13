"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import {
  Bot,
  Send,
  Sparkles,
  Plus,
  MessageSquare,
  PanelLeft,
  Paperclip,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageBubble } from "@/components/assistant/message-bubble"
import { conversations, suggestedPrompts } from "@/lib/mock-data"
import type { ChatMessage, Citation } from "@/types"
import { cn } from "@/lib/utils"

const SAMPLE_CITATIONS: Citation[] = [
  {
    id: "sc1",
    documentName: "Advanced Radar Signal Processing for Target Detection",
    page: 12,
    confidence: 0.96,
    reference: "Ramachandran, A. (2024)",
  },
  {
    id: "sc2",
    documentName: "Metamaterial Antennas for Wideband Applications",
    page: 8,
    confidence: 0.81,
    reference: "Banerjee, A. (2023)",
  },
]

function buildAssistantReply(prompt: string): string {
  return `Based on the DESIDOC knowledge base, here is a synthesis relevant to "${prompt.slice(0, 60)}":\n\nThe indexed literature converges on three key findings. First, adaptive techniques consistently outperform fixed approaches when operating in contested or noisy environments. Second, sensor fusion and multi-domain processing significantly improve robustness at the cost of computational load. Third, recent 2024 publications emphasise machine-learning-assisted methods that reduce manual tuning.\n\nI have attached the most relevant source documents below with page references and confidence scores.`
}

export function AssistantWorkspace() {
  const [historyOpen, setHistoryOpen] = useState(true)
  const [activeId, setActiveId] = useState(conversations[0].id)
  const [messages, setMessages] = useState<ChatMessage[]>(conversations[0].messages)
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, thinking])

  const selectConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id)
    setActiveId(id)
    setMessages(conv?.messages ?? [])
  }

  const startNew = () => {
    setActiveId("")
    setMessages([])
    setInput("")
    textareaRef.current?.focus()
  }

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || thinking) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setThinking(true)

    setTimeout(() => {
      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: buildAssistantReply(trimmed),
        citations: SAMPLE_CITATIONS,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, reply])
      setThinking(false)
    }, 1400)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      send(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Conversation history */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-300 lg:flex",
          historyOpen ? "w-72" : "w-0 overflow-hidden",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border p-3">
          <span className="text-sm font-semibold text-foreground">Conversations</span>
          <Button size="icon-sm" variant="ghost" onClick={startNew} aria-label="New conversation">
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={cn(
                "flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left transition-colors",
                activeId === conv.id ? "bg-primary/10" : "hover:bg-muted",
              )}
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare
                  className={cn(
                    "size-3.5 shrink-0",
                    activeId === conv.id ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "truncate text-sm font-medium",
                    activeId === conv.id ? "text-primary" : "text-foreground",
                  )}
                >
                  {conv.title}
                </span>
              </span>
              <span className="truncate pl-5 text-xs text-muted-foreground">{conv.preview}</span>
              <span className="pl-5 text-[11px] text-muted-foreground/70">{conv.date}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Button
            size="icon-sm"
            variant="ghost"
            className="hidden lg:inline-flex"
            onClick={() => setHistoryOpen((o) => !o)}
            aria-label="Toggle conversation history"
          >
            <PanelLeft className="size-4" />
          </Button>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">AI Knowledge Assistant</p>
            <p className="truncate text-xs text-muted-foreground">
              Answers grounded in the DESIDOC document corpus
            </p>
          </div>
          <Badge variant="success" className="ml-auto">
            <span className="size-1.5 rounded-full bg-success" />
            Online
          </Badge>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-7" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-foreground text-balance">
                Ask the DESIDOC Knowledge Assistant
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground text-pretty">
                Search across 48,000+ indexed documents. Get summaries, comparisons, and citations
                grounded in the defence research corpus.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-muted"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {thinking && (
                <div className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Bot className="size-4" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3.5">
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                    <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-background p-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25">
              <Button size="icon" variant="ghost" className="shrink-0" aria-label="Attach document">
                <Paperclip className="size-4" />
              </Button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask a question or request a summary..."
                className="max-h-40 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button
                size="icon"
                className="shrink-0"
                onClick={() => send(input)}
                disabled={!input.trim() || thinking}
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Responses are generated from indexed documents and may require verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
