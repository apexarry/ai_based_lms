import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Library,
  Upload,
  Bot,
  Star,
  User,
  Users,
  BarChart3,
  Activity,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  adminOnly?: boolean
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Digital Library', href: '/library', icon: Library },
  { label: 'Upload Documents', href: '/upload', icon: Upload },
  { label: 'AI Knowledge Assistant', href: '/assistant', icon: Bot },
  { label: 'Recommendations', href: '/recommendations', icon: Star },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'User Management', href: '/admin/users', icon: Users, adminOnly: true },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, adminOnly: true },
  { label: 'System Health', href: '/admin/health', icon: Activity, adminOnly: true },
]

export const breadcrumbLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  library: 'Digital Library',
  upload: 'Upload Documents',
  assistant: 'AI Knowledge Assistant',
  recommendations: 'Recommendations',
  profile: 'Profile',
  admin: 'Admin',
  'admin/users': 'User Management',
  'admin/analytics': 'Analytics',
  'admin/health': 'System Health',
}
