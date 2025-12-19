import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/icons/BrandLogo'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex shrink-0 items-center">
          <BrandLogo variant="lockup" size={150} />
        </Link>
      </div>
    </header>
  )
}

