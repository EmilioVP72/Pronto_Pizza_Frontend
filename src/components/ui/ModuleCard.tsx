import { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface ModuleCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  colorClass?: string
}

export function ModuleCard({ title, description, icon: Icon, href, colorClass = "text-primary bg-primary/10" }: ModuleCardProps) {
  return (
    <Link 
      to={href}
      className="group block relative overflow-hidden rounded-2xl bg-card border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30"
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-4 rounded-xl transition-colors duration-300", colorClass, "group-hover:bg-primary group-hover:text-primary-foreground")}>
          <Icon className="w-8 h-8" strokeWidth={1.5} />
        </div>
      </div>
      
      <div className="mt-6 space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute -right-12 -top-12 -z-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-150 group-hover:bg-primary/10" />
    </Link>
  )
}
