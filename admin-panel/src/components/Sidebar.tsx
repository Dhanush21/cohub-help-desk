import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { 
  Building2, 
  Home, 
  Users, 
  Settings, 
  BarChart3,
  FileText,
  CreditCard,
  Bell
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Residents', href: '/residents', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3, disabled: true },
  { name: 'Payments', href: '/payments', icon: CreditCard, disabled: true },
  { name: 'Notices', href: '/notices', icon: Bell, disabled: true },
  { name: 'Documents', href: '/documents', icon: FileText, disabled: true },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow bg-card border-r overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 py-6">
          <Building2 className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-xl font-bold text-foreground">CoHub Admin</h1>
            <p className="text-sm text-muted-foreground">Resident Management</p>
          </div>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary border-r-2 border-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                    )
                  }
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                  {item.disabled && (
                    <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      Soon
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}