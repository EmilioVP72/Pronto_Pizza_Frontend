import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { NotificationBell } from './NotificationBell'

export const Header = () => {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div>
        {/* Placeholder for left side elements if needed */}
      </div>
      <div className="flex items-center gap-4">
        {user && <NotificationBell />}
        {user && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{user.nombre_completo}</span>
            <span className="text-muted-foreground">({user.sucursal_codigo})</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Salir
        </Button>
      </div>
    </header>
  )
}
