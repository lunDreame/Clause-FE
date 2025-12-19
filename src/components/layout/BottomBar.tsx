import { Link, useLocation } from 'react-router-dom'
import { BrandLogo } from '@/components/icons/BrandLogo'
import { Upload, History } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomBar() {
  const location = useLocation()

  const navItems = [
    { path: '/upload', icon: Upload, label: '업로드' },
    { path: '/history', icon: History, label: '히스토리' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        <Link
          to="/"
          className={cn(
            'flex flex-col items-center justify-center space-y-1 px-4 py-2',
            location.pathname === '/' && 'text-primary'
          )}
        >
          <BrandLogo variant="mark" size={20} />
          <span className="text-xs">홈</span>
        </Link>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 px-4 py-2',
                isActive && 'text-primary'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

