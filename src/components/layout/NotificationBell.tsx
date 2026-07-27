import { useEffect, useState } from 'react'
import { api } from '@/lib/axios'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface Notificacion {
  id: string
  titulo: string
  mensaje: string
  leida: boolean
  creado_en: string
}

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notificacion[]>([])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notificaciones')
      const data = res.data?.items || res.data
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.leida).length : 0

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notificaciones/${id}/leer`)
      if (Array.isArray(notifications)) {
        setNotifications(notifications.map((n) => (n.id === id ? { ...n, leida: true } : n)))
      }
    } catch (error) {
      console.error('Error marking as read', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.patch('/notificaciones/leer-todas')
      if (Array.isArray(notifications)) {
        setNotifications(notifications.map((n) => ({ ...n, leida: true })))
      }
    } catch (error) {
      console.error('Error marking all as read', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative mr-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button variant="link" className="text-xs p-0 h-auto" onClick={markAllAsRead}>
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {!Array.isArray(notifications) || notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No tienes notificaciones</div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={`flex flex-col items-start p-3 gap-1 cursor-default ${n.leida ? 'opacity-60' : 'bg-muted/30'}`}
                onClick={(e) => e.preventDefault()}
              >
                <div className="flex justify-between w-full items-start gap-2">
                  <span className="font-semibold text-sm leading-none">{n.titulo}</span>
                  {!n.leida && (
                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full" onClick={() => markAsRead(n.id)}>
                      <span className="sr-only">Marcar como leída</span>
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </Button>
                  )}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">{n.mensaje}</span>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {new Date(n.creado_en).toLocaleString()}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
