"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"
import {
  Upload,
  FileText,
  X,
  FileCheck2,
  Loader2,
  Check,
  Paperclip,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DEPARTMENTS, DOCUMENT_TYPES, uploadHistory } from "@/lib/mock-data"

interface StagedFile {
  id: string
  name: string
  size: string
  progress: number
  status: "uploading" | "done"
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadWorkspace() {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState<StagedFile[]>([])
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((list: FileList | null) => {
    if (!list) return
    const next: StagedFile[] = Array.from(list).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      size: formatBytes(f.size),
      progress: 0,
      status: "uploading",
    }))
    setFiles((prev) => [...prev, ...next])

    next.forEach((file) => {
      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id !== file.id) return f
            const inc = Math.random() * 22 + 8
            const progress = Math.min(100, f.progress + inc)
            return {
              ...f,
              progress,
              status: progress >= 100 ? "done" : "uploading",
            }
          }),
        )
      }, 350)
      // stop interval when done
      const stopper = setInterval(() => {
        setFiles((prev) => {
          const target = prev.find((f) => f.id === file.id)
          if (target && target.progress >= 100) {
            clearInterval(interval)
            clearInterval(stopper)
          }
          return prev
        })
      }, 350)
    })
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      addFiles(e.dataTransfer.files)
    },
    [addFiles],
  )

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3500)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Select Files</CardTitle>
            <CardDescription>PDF, DOCX, EPUB or scanned image files up to 100 MB each.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
              )}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload className="size-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drag &amp; drop files here, or <span className="text-primary">browse</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your documents are processed and indexed by the AI engine automatically.
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="sr-only"
                onChange={(e) => addFiles(e.target.files)}
                accept=".pdf,.docx,.epub,.png,.jpg,.jpeg"
              />
            </div>

            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-md",
                        file.status === "done"
                          ? "bg-success/10 text-success"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {file.status === "done" ? (
                        <FileCheck2 className="size-4" />
                      ) : (
                        <FileText className="size-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">{file.size}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              file.status === "done" ? "bg-success" : "bg-primary",
                            )}
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <span className="w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                          {file.status === "done" ? "Indexed" : `${Math.round(file.progress)}%`}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>Documents you have contributed recently.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Title</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadHistory.map((rec) => (
                    <tr key={rec.id} className="border-b border-border last:border-0">
                      <td className="max-w-[220px] px-5 py-3">
                        <p className="truncate font-medium text-foreground">{rec.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{rec.department}</p>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{rec.type}</td>
                      <td className="px-5 py-3 text-muted-foreground">{rec.date}</td>
                      <td className="px-5 py-3">
                        <Badge
                          variant={
                            rec.status === "Completed"
                              ? "success"
                              : rec.status === "Processing"
                                ? "warning"
                                : "destructive"
                          }
                        >
                          {rec.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
            <CardDescription>Add metadata to improve searchability and AI indexing.</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check className="size-6" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Submitted for indexing</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The AI engine is extracting text, keywords, and citations.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="e.g. Adaptive Beamforming for AESA Radar" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author(s)</Label>
                  <Input id="author" placeholder="e.g. Dr. A. Ramachandran" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select id="type" defaultValue="Research Paper">
                      {DOCUMENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input id="year" type="number" placeholder="2026" defaultValue={2026} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select id="department" defaultValue={DEPARTMENTS[0]}>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input id="keywords" placeholder="Comma separated, e.g. Radar, DSP, STAP" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abstract">Abstract</Label>
                  <Textarea id="abstract" rows={4} placeholder="Brief summary of the document..." />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button type="submit" className="flex-1">
                    <Paperclip className="size-4" />
                    Submit for Indexing
                  </Button>
                  <Button type="reset" variant="outline" onClick={() => setFiles([])}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
