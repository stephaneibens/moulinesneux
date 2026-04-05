'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur de connexion.'); return }
      if (data.user.role === 'ADMIN') router.push('/admin/tableau-de-bord')
      else router.push('/locataire/tableau-de-bord')
    } catch {
      setError('Erreur de connexion au serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', position: 'relative', overflow: 'hidden' }}>
      {/* Décoration background */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(128,85,51,0.12)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ width: '72px', height: '72px', background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--radius-2xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto var(--space-4)' }}>
            🏛️
          </div>
          <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 'var(--space-2)' }}>
            Le Moulin d&apos;Esneux
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
            Portail Résidents
          </p>
        </div>

        {/* Carte de connexion */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', boxShadow: 'var(--shadow-xl)' }}>
          <h2 style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
            Connexion à votre espace
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? '⏳ Connexion...' : '🔐 Se connecter'}
            </button>
          </form>

          <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)' }}>
            {/* Espace vide intentionnel ou possibilité d'ajouter info contact */}
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', textAlign: 'center' }}>
              En cas de perte de mot de passe, veuillez contacter le secrétariat.
            </p>
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textAlign: 'center', marginTop: 'var(--space-6)' }}>
          © {new Date().getFullYear()} Le Moulin d&apos;Esneux — Tous droits réservés
        </p>
      </div>
    </main>
  )
}
