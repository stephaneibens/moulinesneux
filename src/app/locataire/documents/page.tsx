'use client'
import { useEffect, useState } from 'react'

interface Document { id: number; nom: string; type: string; description: string | null; url: string; commun: boolean; createdAt: string }
const typeLabel: Record<string, string> = { BAIL: '📜 Bail', AVIS: '📋 Avis', REGLEMENT: '📖 Règlement', FACTURE: '🧾 Facture', AUTRE: '📄 Autre' }

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  useEffect(() => { fetch('/api/locataire/documents').then(r => r.json()).then(setDocuments) }, [])

  const communs = documents.filter(d => d.commun)
  const perso = documents.filter(d => !d.commun)

  return (
    <div>
      <header className="page-header"><h1>📄 Mes documents</h1></header>
      <div className="page-body">
        {communs.length > 0 && (
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <h2 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-display)' }}>📁 Documents communs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {communs.map(d => (
                <div key={d.id} style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ width: '44px', height: '44px', background: 'var(--info-container)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>📄</div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{d.nom}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-muted)', marginTop: '2px' }}>{typeLabel[d.type]} · {new Date(d.createdAt).toLocaleDateString('fr-BE')}</p>
                    </div>
                  </div>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">⬇️ Télécharger</a>
                </div>
              ))}
            </div>
          </section>
        )}

        {perso.length > 0 && (
          <section>
            <h2 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-display)' }}>👤 Mes documents personnels</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {perso.map(d => (
                <div key={d.id} style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ width: '44px', height: '44px', background: 'var(--warning-container)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📜</div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{d.nom}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-muted)', marginTop: '2px' }}>{typeLabel[d.type]} · {new Date(d.createdAt).toLocaleDateString('fr-BE')}</p>
                    </div>
                  </div>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">⬇️ Télécharger</a>
                </div>
              ))}
            </div>
          </section>
        )}

        {documents.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--on-surface-muted)' }}>
            <p style={{ fontSize: '3rem' }}>📭</p><p>Aucun document disponible.</p>
          </div>
        )}
      </div>
    </div>
  )
}
