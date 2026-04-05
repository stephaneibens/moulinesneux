'use client'
import { useEffect, useState } from 'react'

interface Paiement { id: number; periode: string; montant: number; statut: string; datePaiement: string | null; reference: string | null }

const statutInfo: Record<string, { label: string; chip: string; icon: string }> = {
  PAYE: { label: 'Payé', chip: 'chip-success', icon: '✅' },
  EN_ATTENTE: { label: 'En attente', chip: 'chip-warning', icon: '⏳' },
  RETARD: { label: 'En retard', chip: 'chip-error', icon: '🔴' },
}

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/locataire/paiements').then(r => r.json()).then(d => { setPaiements(d); setLoading(false) })
  }, [])

  const marquerPayé = async (id: number) => {
    setPaying(id)
    try {
      const res = await fetch('/api/locataire/paiements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paiementId: id }) })
      if (res.ok) {
        setPaiements(prev => prev.map(p => p.id === id ? { ...p, statut: 'PAYE', datePaiement: new Date().toISOString() } : p))
        setMessage('✅ Paiement enregistré avec succès !')
        setTimeout(() => setMessage(''), 4000)
      }
    } finally { setPaying(null) }
  }

  const total = paiements.reduce((s, p) => s + (p.statut === 'PAYE' ? p.montant : 0), 0)
  const enAttente = paiements.filter(p => p.statut !== 'PAYE').length

  return (
    <div>
      <header className="page-header">
        <h1>💳 Mes paiements</h1>
      </header>
      <div className="page-body">
        {message && <div className="alert alert-success">{message}</div>}

        <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card"><div className="stat-icon success">💰</div><div className="stat-content"><p className="stat-label">Total payé</p><p className="stat-value">{total.toFixed(0)}€</p></div></div>
          <div className="stat-card"><div className={`stat-icon ${enAttente > 0 ? 'error' : 'success'}`}>{enAttente > 0 ? '⚠️' : '✅'}</div><div className="stat-content"><p className="stat-label">En attente</p><p className="stat-value">{enAttente}</p></div></div>
          <div className="stat-card"><div className="stat-icon primary">📋</div><div className="stat-content"><p className="stat-label">Total échéances</p><p className="stat-value">{paiements.length}</p></div></div>
        </div>

        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>Historique des paiements</h3></div>
          <div className="table-wrapper" style={{ borderRadius: 0 }}>
            {loading ? (
              <p style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--on-surface-muted)' }}>Chargement...</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Période</th>
                    <th>Montant</th>
                    <th>Date paiement</th>
                    <th>Référence</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paiements.map(p => {
                    const info = statutInfo[p.statut] || { label: p.statut, chip: 'chip-neutral', icon: '?' }
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.periode}</td>
                        <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{p.montant.toFixed(2)} €</td>
                        <td style={{ color: 'var(--on-surface-muted)', fontSize: '0.85rem' }}>
                          {p.datePaiement ? new Date(p.datePaiement).toLocaleDateString('fr-BE') : '—'}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)', fontFamily: 'monospace' }}>{p.reference || '—'}</td>
                        <td><span className={`chip ${info.chip}`}>{info.icon} {info.label}</span></td>
                        <td>
                          {p.statut !== 'PAYE' ? (
                            <button
                              onClick={() => marquerPayé(p.id)}
                              disabled={paying === p.id}
                              className="btn btn-success btn-sm"
                            >
                              {paying === p.id ? '⏳...' : '✅ Marquer payé'}
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>✅ Acquitté</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
