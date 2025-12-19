import { cn } from '@/lib/utils'
import logoMark from '@/assets/brand/logo-mark.svg?react'
import logoLockup from '@/assets/brand/logo-lockup.svg?react'

interface BrandLogoProps {
  variant: 'mark' | 'lockup'
  size?: number
  className?: string
}

export function BrandLogo({ variant, size = 24, className }: BrandLogoProps) {
  const LogoComponent = variant === 'mark' ? logoMark : logoLockup
  const width = variant === 'mark' ? size : size * 5.83
  const height = variant === 'mark' ? size : size * 1.17
  const colorClass = variant === 'mark' ? 'text-primary' : 'text-foreground'

  return (
    <LogoComponent
      width={width}
      height={height}
      className={cn(colorClass, className)}
    />
  )
}

