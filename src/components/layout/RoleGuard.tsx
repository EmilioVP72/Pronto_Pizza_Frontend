import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
