'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Paiement { id: number; periode: string; montant: number; statut: string; datePaiement: string | null }
interface Annonce { id: number; titre: string; priorite: string; createdAt: string }
interface Intervention { id: number; categorie: string; statut: string; createdAt: string }
interface User { prenom: string; nom: string; appartement: { numero: string; type: string; loyerMensuel: number; chargeMensuelle: number } | null }

const statutPaiementLabel: Record<string, { label: string; chip: string }> = {
  PAYE: { label: 'Payé', chip: 'chip-success' },
  EN_ATTENTE: { label: 'En attente', chip: 'chip-warning' },
  RETARD: { label: 'En retard', chip: 'chip-error' },
}

const statutIntLabel: Record<string, { label: string; chip: string }> = {
  SOUMISE: { label: 'Soumise', chip: 'chip-neutral' },
  EN_COURS: { label: 'En cours', chip: 'chip-warning' },
  RESOLUE: { label: 'Résolue', chip: 'chip-success' },
  ANNULEE: { label: 'Annulée', chip: 'chip-error' },
}

export default function TableauDeBordLocataire() {
  const [user, setUser] = useState<User | null>(null)
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [interventions, setInterventions] = useState<Intervention[]>([])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
    fetch('/api/locataire/paiements').then(r => r.json()).then(setPaiements)
    fetch('/api/locataire/annonces').then(r => r.json()).then(d => setAnnonces(d.slice(0, 3)))
    fetch('/api/locataire/interventions').then(r => r.json()).then(d => setInterventions(d.slice(0, 3)))
  }, [])

  const dernierPaiement = paiements[0]
  const paiementsEnAttente = paiements.filter(p => p.statut === 'EN_ATTENTE' || p.statut === 'RETARD').length

  return (
    <div>
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>
            Bonjour {user?.prenom || '—'} 👋
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)', marginTop: '2px' }}>
            {new Date().toLocaleDateString('fr-BE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/locataire/profil" className="btn btn-secondary btn-sm">👤 Mon profil</Link>
      </header>

      <div className="page-body">
        {/* Stats */}
        <div className="grid-stats">
          <div className="stat-card">
            <div className="stat-icon primary">🏠</div>
            <div className="stat-content">
              <p className="stat-label">Appartement</p>
              <p className="stat-value" style={{ fontSize: '1.4rem' }}>{user?.appartement?.numero || '—'}</p>
              <p className="stat-sub">{user?.appartement?.type || 'Chargement...'}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon secondary">💳</div>
            <div className="stat-content">
              <p className="stat-label">Loyer mensuel</p>
              <p className="stat-value">{user?.appartement ? (user.appartement.loyerMensuel + user.appartement.chargeMensuelle).toFixed(0) : '—'}€</p>
              <p className="stat-sub">Loyer + charges</p>
            </div>
          </div>

          <div className="stat-card">
            <div className={`stat-icon ${paiementsEnAttente > 0 ? 'error' : 'success'}`}>
              {paiementsEnAttente > 0 ? '⚠️' : '✅'}
            </div>
            <div className="stat-content">
              <p className="stat-label">Paiements en attente</p>
              <p className="stat-value">{paiementsEnAttente}</p>
              <p className="stat-sub">{paiementsEnAttente === 0 ? 'Tout est à jour !' : 'À régulariser'}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon primary">🔧</div>
            <div className="stat-content">
              <p className="stat-label">Interventions actives</p>
              <p className="stat-value">{interventions.filter(i => i.statut === 'EN_COURS' || i.statut === 'SOUMISE').length}</p>
              <p className="stat-sub">En cours de traitement</p>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 'var(--space-6)' }}>
          {/* Paiements récents */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>💳 Encours des quittances</h3>
              <Link href="/locataire/paiements" className="btn btn-ghost btn-sm">Voir tout →</Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {paiements.length === 0 ? (
                <p style={{ padding: 'var(--space-6)', color: 'var(--on-surface-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Aucun paiement.</p>
              ) : paiements.slice(0, 3).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--surface-low)' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.periode}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>{p.montant.toFixed(2)} €</p>
                  </div>
                  <span className={`chip ${statutPaiementLabel[p.statut]?.chip || 'chip-neutral'}`}>
                    {statutPaiementLabel[p.statut]?.label || p.statut}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Annonces */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>📢 Dernières annonces</h3>
              <Link href="/locataire/annonces" className="btn btn-ghost btn-sm">Voir tout →</Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {annonces.length === 0 ? (
                <p style={{ padding: 'var(--space-6)', color: 'var(--on-surface-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Aucune annonce.</p>
              ) : annonces.map(a => (
                <div key={a.id} style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--surface-low)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', flex: 1 }}>{a.titre}</p>
                    <span className={`chip ${a.priorite === 'URGENTE' ? 'chip-error' : a.priorite === 'INFO' ? 'chip-info' : 'chip-neutral'}`} style={{ flexShrink: 0 }}>
                      {a.priorite === 'URGENTE' ? '🔴 Urgent' : a.priorite === 'INFO' ? 'ℹ️ Info' : 'Normal'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', marginTop: 'var(--space-1)' }}>
                    {new Date(a.createdAt).toLocaleDateString('fr-BE')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interventions récentes */}
        {interventions.length > 0 && (
          <div className="card" style={{ marginTop: 'var(--space-6)' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>🔧 Mes demandes d&apos;intervention</h3>
              <Link href="/locataire/interventions" className="btn btn-ghost btn-sm">Gérer →</Link>
            </div>
            <div className="table-wrapper" style={{ borderRadius: 0 }}>
              <table className="table">
                <thead><tr><th>Catégorie</th><th>Statut</th><th>Date</th></tr></thead>
                <tbody>
                  {interventions.map(i => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: 500 }}>{i.categorie}</td>
                      <td><span className={`chip ${statutIntLabel[i.statut]?.chip}`}>{statutIntLabel[i.statut]?.label}</span></td>
                      <td style={{ color: 'var(--on-surface-muted)', fontSize: '0.85rem' }}>{new Date(i.createdAt).toLocaleDateString('fr-BE')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Raccourcis rapides */}
        <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Link href="/locataire/interventions" className="btn btn-primary">🔧 Signaler un problème</Link>
          <Link href="/locataire/documents" className="btn btn-secondary">📄 Mes documents</Link>
          <Link href="/locataire/paiements" className="btn btn-secondary">💳 Mes paiements</Link>
        </div>
      </div>
    </div>
  )
}
