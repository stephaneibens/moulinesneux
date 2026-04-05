import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'

export default async function LocataireLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'LOCATAIRE') redirect('/login')
  return (
    <div className="app-layout">
      <Sidebar role="LOCATAIRE" user={{ nom: user.nom, prenom: user.prenom, email: user.email, appartement: user.appartement }} />
      <main className="main-content">{children}</main>
    </div>
  )
}
