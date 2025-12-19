import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomBar } from './BottomBar'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomBar />
    </div>
  )
}

