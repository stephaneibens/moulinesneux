'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface NavItem { href: string; icon: string; label: string }

interface SidebarProps {
  role: 'LOCATAIRE' | 'ADMIN'
  user: { nom: string; prenom: string; email: string; appartement?: { numero: string } | null }
}

const navLocataire: NavItem[] = [
  { href: '/locataire/tableau-de-bord', icon: '🏠', label: 'Tableau de bord' },
  { href: '/locataire/mon-appartement', icon: '🏢', label: 'Mon appartement' },
  { href: '/locataire/paiements', icon: '💳', label: 'Mes paiements' },
  { href: '/locataire/annonces', icon: '📢', label: 'Annonces' },
  { href: '/locataire/interventions', icon: '🔧', label: 'Interventions' },
  { href: '/locataire/documents', icon: '📄', label: 'Mes documents' },
  { href: '/locataire/profil', icon: '👤', label: 'Mon profil' },
]

const navAdmin: NavItem[] = [
  { href: '/admin/tableau-de-bord', icon: '📊', label: 'Tableau de bord' },
  { href: '/admin/appartements', icon: '🏢', label: 'Appartements' },
  { href: '/admin/locataires', icon: '👥', label: 'Locataires' },
  { href: '/admin/paiements', icon: '💳', label: 'Paiements' },
  { href: '/admin/annonces', icon: '📢', label: 'Annonces' },
  { href: '/admin/interventions', icon: '🔧', label: 'Interventions' },
  { href: '/admin/documents', icon: '📄', label: 'Documents' },
]

export default function Sidebar({ role, user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const navItems = role === 'ADMIN' ? navAdmin : navLocataire

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <>
      {/* Bouton hamburger mobile (dans le header de page) */}
      <button
        id="hamburger-btn"
        className="hamburger"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 60, display: 'none' }}
      >
        <span /><span /><span />
      </button>

      {/* Overlay mobile */}
      <div
        className={`sidebar-overlay ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🏛️</div>
            <div>
              <h1 style={{ fontSize: '0.95rem', color: 'white', fontWeight: 800 }}>Le Moulin<br />d&apos;Esneux</h1>
            </div>
          </div>
          {/* Profil utilisateur */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)' }}>
            <p style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>{user.prenom} {user.nom}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: '2px' }}>
              {role === 'ADMIN' ? '⚙️ Administrateur' : `🏠 Apt. ${user.appartement?.numero || '—'}`}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="nav-section-label">{role === 'ADMIN' ? 'Administration' : 'Mon espace'}</p>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="nav-item"
            style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'rgba(186,26,26,0.15)', color: '#ff9e9e' }}
          >
            <span className="nav-icon">🚪</span>
            {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
          </button>
        </div>
      </aside>

      {/* Style mobile */}
      <style>{`
        @media (max-width: 1024px) {
          #hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
