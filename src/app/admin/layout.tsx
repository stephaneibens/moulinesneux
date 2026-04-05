import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')
  return (
    <div className="app-layout">
      <Sidebar role="ADMIN" user={{ nom: user.nom, prenom: user.prenom, email: user.email }} />
      <main className="main-content">{children}</main>
    </div>
  )
}
