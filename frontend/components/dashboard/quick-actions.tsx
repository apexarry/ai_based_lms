'use client'

import { useRouter } from 'next/navigation'
import { Upload, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Button onClick={() => router.push('/assistant')}>
        <Bot className="size-4" />
        Ask AI
      </Button>
      <Button onClick={() => router.push('/upload')}>
        <Upload className="size-4" />
        Quick Upload
      </Button>
    </div>
  )
}
