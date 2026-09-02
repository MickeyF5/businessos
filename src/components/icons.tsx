import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Brain,
  Calculator,
  Check,
  Circle,
  FolderKanban,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PencilLine,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCircle2,
  Users,
  X,
} from 'lucide-react'

export const VzmIcons = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  stock: Package,
  bell: Bell,
  customers: Users,
  network: Handshake,
  strategy: Brain,
  executive: ShieldCheck,
  admin: ShieldCheck,
  jobCosting: Calculator,
  logout: LogOut,
  user: UserCircle2,
  menu: Menu,
  close: X,
  chart: BarChart3,
  plus: Plus,
  edit: PencilLine,
  delete: Trash2,
  back: ArrowLeft,
  search: Search,
  check: Check,
  circle: Circle,
} as const

export type VzmIconName = keyof typeof VzmIcons

export function VzmIcon({
  name,
  size = 18,
  className = '',
}: {
  name: VzmIconName
  size?: number
  className?: string
}) {
  const Icon = VzmIcons[name] as LucideIcon

  return <Icon size={size} className={className} />
}
