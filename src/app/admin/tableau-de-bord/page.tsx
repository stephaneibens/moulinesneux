'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats { totalLocataires: number; paiementsEnAttente: number; interventionsEnCours: number; totalAppartements: number; totalLoyers: number }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  useEffect(() => { fetch('/api/admin/stats').then(r => r.json()).then(setStats) }, [])

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 style={{ color: 'var(--primary)' }}>📊 Tableau de bord</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)', marginTop: '2px' }}>
            {new Date().toLocaleDateString('fr-BE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>
      <div className="page-body">
        <div className="grid-stats">
          <div className="stat-card">
            <div className="stat-icon primary">👥</div>
            <div className="stat-content">
              <p className="stat-label">Locataires actifs</p>
              <p className="stat-value">{stats?.totalLocataires ?? '—'}</p>
              <p className="stat-sub">Sur {stats?.totalAppartements ?? '—'} appartements</p>
            </div>
          </div>
          <div className="stat-card">
            <div className={`stat-icon ${(stats?.paiementsEnAttente ?? 0) > 0 ? 'error' : 'success'}`}>💳</div>
            <div className="stat-content">
              <p className="stat-label">Paiements en attente</p>
              <p className="stat-value">{stats?.paiementsEnAttente ?? '—'}</p>
              <p className="stat-sub">{(stats?.paiementsEnAttente ?? 0) === 0 ? 'Tout est à jour !' : 'À traiter'}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className={`stat-icon ${(stats?.interventionsEnCours ?? 0) > 0 ? 'secondary' : 'success'}`}>🔧</div>
            <div className="stat-content">
              <p className="stat-label">Interventions en cours</p>
              <p className="stat-value">{stats?.interventionsEnCours ?? '—'}</p>
              <p className="stat-sub">Soumises ou en cours</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success">💰</div>
            <div className="stat-content">
              <p className="stat-label">Loyers encaissés (Mars)</p>
              <p className="stat-value" style={{ fontSize: '1.4rem' }}>{stats ? `${stats.totalLoyers.toFixed(0)}€` : '—'}</p>
              <p className="stat-sub">Paiements reçus</p>
            </div>
          </div>
        </div>

        {/* Raccourcis back-office */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: 'var(--space-4)' }}>⚡ Accès rapides</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          {[
            { href: '/admin/locataires', icon: '👥', label: 'Gérer les locataires', color: 'var(--info-container)' },
            { href: '/admin/paiements', icon: '💳', label: 'Gérer les paiements', color: 'var(--success-container)' },
            { href: '/admin/interventions', icon: '🔧', label: 'Voir les interventions', color: 'var(--warning-container)' },
            { href: '/admin/annonces', icon: '📢', label: 'Publier une annonce', color: 'var(--info-container)' },
            { href: '/admin/appartements', icon: '🏢', label: 'Gérer les appartements', color: 'var(--surface-container)' },
            { href: '/admin/documents', icon: '📄', label: 'Gérer les documents', color: 'var(--warning-container)' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ background: item.color, borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', textDecoration: 'none', transition: 'all var(--transition)', transform: 'translateY(0)', boxShadow: 'var(--shadow-sm)' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)' }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '1.75rem' }}>{item.icon}</span>
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--on-surface)' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
