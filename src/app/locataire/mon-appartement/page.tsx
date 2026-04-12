'use client'
import { useEffect, useState } from 'react'

interface Appartement { numero: string; bloc: string; etage: number; type: string; surface: number; loyerMensuel: number; chargeMensuelle: number; description: string | null; peb: string | null; ean: string | null }
interface User { prenom: string; nom: string; email: string; dateEcheanceBail: string | null; appartement: Appartement | null }

export default function MonAppartementPage() {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
  }, [])
  const apt = user?.appartement

  return (
    <div>
      <header className="page-header"><h1>🏢 Mon appartement</h1></header>
      <div className="page-body">
        {!apt ? (
          <p style={{ textAlign: 'center', color: 'var(--on-surface-muted)', padding: 'var(--space-16)' }}>Chargement...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* En-tête appartement */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: 'var(--space-2)' }}>Appartement</p>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>N° {apt.numero}</h2>
                  <p style={{ opacity: 0.8, marginTop: 'var(--space-2)' }}>Bloc {apt.bloc} — Étage {apt.etage === 0 ? 'Rez-de-chaussée' : apt.etage}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: 'var(--space-1)' }}>Loyer + charges</p>
                  <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{(apt.loyerMensuel + apt.chargeMensuelle).toFixed(0)} €</p>
                  <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>par mois</p>
                </div>
              </div>
            </div>

            <div className="grid-2">
              {/* Détails */}
              <div className="card">
                <div className="card-header"><h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>📋 Caractéristiques</h3></div>
                <div className="card-body">
                  {[
                    { label: 'Type', value: apt.type },
                    { label: 'Bloc', value: apt.bloc },
                    { label: 'Étage', value: apt.etage === 0 ? 'Rez-de-chaussée' : `${apt.etage}ème étage` },
                    { label: 'Surface', value: `${apt.surface} m²` },
                    { label: 'PEB', value: apt.peb || 'Non défini' },
                    { label: 'EAN', value: apt.ean || 'Non défini' },
                    { label: 'Fin de bail', value: user?.dateEcheanceBail ? new Date(user.dateEcheanceBail).toLocaleDateString('fr-BE') : 'Non définie' },
                    { label: 'Loyer de base', value: `${apt.loyerMensuel.toFixed(2)} €` },
                    { label: 'Charges mensuelles', value: `${apt.chargeMensuelle.toFixed(2)} €` },
                    { label: 'Total mensuel', value: `${(apt.loyerMensuel + apt.chargeMensuelle).toFixed(2)} €` },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--surface-low)' }}>
                      <span style={{ color: 'var(--on-surface-muted)', fontSize: '0.88rem' }}>{r.label}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="card">
                <div className="card-header"><h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>📝 Description</h3></div>
                <div className="card-body">
                  <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.8, fontSize: '0.9rem' }}>{apt.description || 'Aucune description disponible.'}</p>
                  <div style={{ marginTop: 'var(--space-6)', background: 'var(--info-container)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                    <p style={{ color: 'var(--info)', fontSize: '0.85rem', fontWeight: 600 }}>ℹ️ Pour toute question concernant votre logement</p>
                    <p style={{ color: 'var(--info)', fontSize: '0.8rem', marginTop: 'var(--space-2)' }}>Contactez-nous : <strong>admin@moulinesneux.be</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
