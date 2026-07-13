import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  BookOpen,
  FileStack,
  ScanLine,
  Bot,
  Users,
  FileQuestion,
} from 'lucide-react'
import type { DocumentType } from '@/types'

export const statIcons: Record<string, LucideIcon> = {
  FileText,
  BookOpen,
  FileStack,
  ScanLine,
  Bot,
  Users,
}

export const docTypeIcons: Record<DocumentType, LucideIcon> = {
  Book: BookOpen,
  'Research Paper': FileText,
  'Technical Report': FileStack,
  'Scanned PDF': ScanLine,
}

export const fallbackIcon = FileQuestion
