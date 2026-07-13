'use client'

import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/search-bar'

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <div className="w-full sm:w-64">
        <SearchBar
          placeholder="Quick search..."
          onSubmit={() => router.push('/library')}
        />
      </div>
      <Button onClick={() => router.push('/upload')}>
        <Upload className="size-4" />
        Quick Upload
      </Button>
    </div>
  )
}
