'use client'

import { useEffect, useState } from 'react'
import { getProfile, type DashboardProfile } from '@/lib/api'

export default function Page() {
  const [profile, setProfile] = useState<DashboardProfile | null>(null)

  useEffect(() => {
    getProfile().then(setProfile).catch(console.error)
  }, [])

  if (!profile) return null

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Profile</h1>

      <div className="mt-8 rounded-xl border p-6">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
            {profile.initials}
          </div>

          <div>
            <h2 className="text-2xl font-semibold">{profile.name}</h2>
            <p className="text-gray-400">DESIDOC AI Knowledge Library</p>
            <p className="text-gray-500">{profile.role}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-gray-400">Documents Read</p>
            <h3 className="mt-2 text-3xl font-bold">{profile.documents_read}</h3>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-gray-400">AI Conversations</p>
            <h3 className="mt-2 text-3xl font-bold">{profile.conversations}</h3>
          </div>

          <a href="/library?bookmarked=true" className="block rounded-lg border p-4 transition-colors hover:bg-muted">
            <p className="text-gray-400">Bookmarks</p>
            <h3 className="mt-2 text-3xl font-bold">{profile.bookmarks}</h3>
          </a>
        </div>
      </div>
    </div>
  )
}
