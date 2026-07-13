import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Library,
  Upload,
  Bot,
  Star,
  User,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Digital Library', href: '/library', icon: Library },
  { label: 'Upload Documents', href: '/upload', icon: Upload },
  { label: 'AI Knowledge Assistant', href: '/assistant', icon: Bot },
  { label: 'Recommendations', href: '/recommendations', icon: Star },
  { label: 'Profile', href: '/profile', icon: User },
]

export const breadcrumbLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  library: 'Digital Library',
  upload: 'Upload Documents',
  assistant: 'AI Knowledge Assistant',
  recommendations: 'Recommendations',
  profile: 'Profile',
}
