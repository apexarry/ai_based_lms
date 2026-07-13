import type { Metadata } from 'next'
import { LibraryBrowser } from '@/components/library/library-browser'

export const metadata: Metadata = {
  title: 'Digital Library · DESIDOC AI Knowledge Library',
}

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <LibraryBrowser />
    </div>
  )
}
