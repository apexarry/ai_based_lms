'use client'

import { useMemo, useState } from 'react'
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { SearchBar } from '@/components/search-bar'
import { DocumentCard } from '@/components/cards/document-card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/states'
import { documents, DEPARTMENTS, DOCUMENT_TYPES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const YEARS = ['All years', '2024', '2023', '2022', '2021', '2020', 'Older']
const SORTS = ['Newest first', 'Oldest first', 'Title A–Z', 'Title Z–A']
const AUTHORS = ['All authors', ...Array.from(new Set(documents.map((d) => d.author)))]

export function LibraryBrowser() {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [author, setAuthor] = useState('All authors')
  const [department, setDepartment] = useState('All departments')
  const [year, setYear] = useState('All years')
  const [type, setType] = useState('All types')
  const [sort, setSort] = useState('Newest first')

  const results = useMemo(() => {
    let list = documents.filter((d) => {
      const q = query.toLowerCase()
      const matchesQuery =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.author.toLowerCase().includes(q) ||
        d.keywords.some((k) => k.toLowerCase().includes(q))
      const matchesAuthor = author === 'All authors' || d.author === author
      const matchesDept = department === 'All departments' || d.department === department
      const matchesType = type === 'All types' || d.type === type
      const matchesYear =
        year === 'All years' ||
        (year === 'Older' ? d.year < 2020 : String(d.year) === year)
      return matchesQuery && matchesAuthor && matchesDept && matchesType && matchesYear
    })

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'Oldest first':
          return a.year - b.year
        case 'Title A–Z':
          return a.title.localeCompare(b.title)
        case 'Title Z–A':
          return b.title.localeCompare(a.title)
        default:
          return b.year - a.year
      }
    })
    return list
  }, [query, author, department, year, type, sort])

  const activeFilters = [
    author !== 'All authors' && author,
    department !== 'All departments' && department,
    year !== 'All years' && year,
    type !== 'All types' && type,
  ].filter(Boolean) as string[]

  function resetFilters() {
    setAuthor('All authors')
    setDepartment('All departments')
    setYear('All years')
    setType('All types')
    setQuery('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Library"
        description={`${documents.length.toLocaleString()} documents across ${DEPARTMENTS.length} departments`}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <SearchBar value={query} onChange={setQuery} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters((s) => !s)}
            aria-pressed={showFilters}
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge className="ml-1">{activeFilters.length}</Badge>
            )}
          </Button>
          <div className="w-44">
            <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              {SORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-center rounded-lg border border-border p-0.5">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'flex size-7 items-center justify-center rounded-md transition-colors',
                view === 'grid'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'flex size-7 items-center justify-center rounded-md transition-colors',
                view === 'list'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label="List view"
              aria-pressed={view === 'list'}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters row */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-4">
          <FilterSelect label="Author" value={author} onChange={setAuthor} options={AUTHORS} />
          <FilterSelect
            label="Department"
            value={department}
            onChange={setDepartment}
            options={['All departments', ...DEPARTMENTS]}
          />
          <FilterSelect label="Year" value={year} onChange={setYear} options={YEARS} />
          <FilterSelect
            label="Document Type"
            value={type}
            onChange={setType}
            options={['All types', ...DOCUMENT_TYPES]}
          />
        </div>
      )}

      {/* Active filters + count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{results.length}</span>{' '}
          {results.length === 1 ? 'result' : 'results'}
        </p>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((f) => (
              <Badge key={f} variant="outline">
                {f}
              </Badge>
            ))}
            <Button variant="ghost" size="xs" onClick={resetFilters}>
              <X className="size-3" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <EmptyState
          title="No documents found"
          description="Try adjusting your search terms or filters to find what you are looking for."
          action={
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset filters
            </Button>
          }
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} view="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} view="list" />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </Select>
    </div>
  )
}
