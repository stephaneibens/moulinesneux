'use client'
import { useEffect, useState } from 'react'

interface Annonce { id: number; titre: string; contenu: string; priorite: string; createdAt: string; publiePar: { prenom: string; nom: string } }

const prioriteInfo: Record<string, { label: string; chip: string; border: string }> = {
  URGENTE: { label: '🔴 Urgent', chip: 'chip-error', border: '#ffdad6' },
  NORMALE: { label: '📌 Normal', chip: 'chip-neutral', border: 'var(--surface-container)' },
  INFO: { label: 'ℹ️ Info', chip: 'chip-info', border: 'var(--info-container)' },
}

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/locataire/annonces').then(r => r.json()).then(d => { setAnnonces(d); setLoading(false) })
  }, [])

  return (
    <div>
      <header className="page-header"><h1>📢 Annonces de l&apos;immeuble</h1></header>
      <div className="page-body">
        {loading && <p style={{ textAlign: 'center', color: 'var(--on-surface-muted)' }}>Chargement...</p>}
        {!loading && annonces.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--on-surface-muted)' }}>
            <p style={{ fontSize: '3rem' }}>📭</p>
            <p>Aucune annonce pour le moment.</p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {annonces.map(a => {
            const info = prioriteInfo[a.priorite] || prioriteInfo.NORMALE
            return (
              <div key={a.id} style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)', borderLeft: `4px solid ${info.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', flex: 1 }}>{a.titre}</h3>
                  <span className={`chip ${info.chip}`}>{info.label}</span>
                </div>
                <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7, fontSize: '0.9rem' }}>{a.contenu}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', marginTop: 'var(--space-4)' }}>
                  Publié par {a.publiePar.prenom} {a.publiePar.nom} · {new Date(a.createdAt).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
