'use client'
import { useEffect, useState } from 'react'

interface Intervention { id: number; categorie: string; description: string; statut: string; priorite: string; commentaireAdmin: string | null; localisation?: string | null; photos?: string[]; createdAt: string; updatedAt: string; dateInterventionEstimee?: string | null; dateCloture?: string | null; montantLocataire?: number | null; montantProprietaire?: number | null; }

const CATEGORIES = ['PLOMBERIE', 'ELECTRICITE', 'CHAUFFAGE', 'MENUISERIE', 'SERRURERIE', 'PEINTURE', 'NETTOYAGE', 'AUTRE']
const catLabel: Record<string, string> = { PLOMBERIE: '🚿 Plomberie', ELECTRICITE: '⚡ Électricité', CHAUFFAGE: '🔥 Chauffage', MENUISERIE: '🪵 Menuiserie', SERRURERIE: '🔑 Serrurerie', PEINTURE: '🎨 Peinture', NETTOYAGE: '🧹 Nettoyage', AUTRE: '🔧 Autre' }
const statutInfo: Record<string, { label: string; chip: string }> = {
  SOUMISE: { label: 'Soumise', chip: 'chip-neutral' }, EN_COURS: { label: 'En cours', chip: 'chip-warning' }, RESOLUE: { label: 'Résolue', chip: 'chip-success' }, ANNULEE: { label: 'Annulée', chip: 'chip-error' }
}

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [showForm, setShowForm] = useState(false)
  const [categorie, setCategorie] = useState('PLOMBERIE')
  const [localisation, setLocalisation] = useState('')
  const [photosFiles, setPhotosFiles] = useState<File[]>([])
  const [description, setDescription] = useState('')
  const [priorite, setPriorite] = useState('NORMALE')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    fetch('/api/locataire/interventions').then(r => r.json()).then(setInterventions)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedObj = Array.from(e.target.files)
      setUploadError('')
      const invalids = selectedObj.filter(f => f.size > 70 * 1024 * 1024)
      if (invalids.length > 0) {
        setUploadError('Certaines photos dépassent la taille maximale de 70 MB.')
        return
      }
      setPhotosFiles(selectedObj)
    }
  }

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !localisation) return
    setSubmitting(true)
    setUploadError('')
    
    const photosUrls: string[] = []
    try {
      for (const file of photosFiles) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Erreur upload')
        photosUrls.push(uploadData.url)
      }
    } catch(e: any) {
      setUploadError(e.message)
      setSubmitting(false)
      return
    }

    const res = await fetch('/api/locataire/interventions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categorie, description, priorite, localisation, photos: photosUrls }),
    })
    if (res.ok) {
      const newItem = await res.json()
      setInterventions(prev => [newItem, ...prev])
      setDescription(''); setShowForm(false); setLocalisation(''); setPhotosFiles([]);
      setMsg('✅ Demande soumise avec succès !')
      setTimeout(() => setMsg(''), 4000)
    }
    setSubmitting(false)
  }

  return (
    <div>
      <header className="page-header">
        <h1>🔧 Mes demandes d&apos;intervention</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>➕ Nouvelle demande</button>
      </header>
      <div className="page-body">
        {msg && <div className="alert alert-success">{msg}</div>}

        {showForm && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
            <div className="modal">
              <div className="modal-header">
                <h3>🔧 Nouvelle demande d&apos;intervention</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form onSubmit={soumettre}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Catégorie</label>
                    <select className="form-select" value={categorie} onChange={e => setCategorie(e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{catLabel[c]}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Localisation du problème *</label>
                    <select className="form-select" value={localisation} onChange={e => setLocalisation(e.target.value)} required>
                      <option value="" disabled>Sélectionnez la localisation</option>
                      <option value="Dans mon appartement">Dans mon appartement</option>
                      <option value="Dans l'immeuble">Dans l'immeuble</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priorité</label>
                    <select className="form-select" value={priorite} onChange={e => setPriorite(e.target.value)}>
                      <option value="BASSE">🟢 Basse</option>
                      <option value="NORMALE">🟡 Normale</option>
                      <option value="URGENTE">🔴 Urgente</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description du problème *</label>
                    <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez le problème en détail..." required rows={4} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="form-label">Photos (JPG, PNG, max 70 MB)</label>
                    <input type="file" className="form-control" multiple accept="image/png, image/jpeg" onChange={handleFileChange} />
                    {uploadError && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: 'var(--space-2)' }}>{uploadError}</p>}
                    {photosFiles.length > 0 && <p style={{ fontSize: '0.8rem', marginTop: 'var(--space-2)' }}>{photosFiles.length} fichier(s) sélectionné(s)</p>}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '⏳ Envoi...' : '📤 Soumettre'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {interventions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--on-surface-muted)' }}>
            <p style={{ fontSize: '3rem' }}>🔧</p>
            <p style={{ marginBottom: 'var(--space-4)' }}>Aucune demande d&apos;intervention.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>➕ Signaler un problème</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {interventions.map(i => {
              const si = statutInfo[i.statut] || { label: i.statut, chip: 'chip-neutral' }
              return (
                <div key={i.id} className="card" style={{ padding: 0 }}>
                  <div style={{ padding: 'var(--space-5) var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{catLabel[i.categorie] || i.categorie}</span>
                        {i.priorite === 'URGENTE' && <span className="chip chip-error">🔴 Urgent</span>}
                      </div>
                      <span className={`chip ${si.chip}`}>{si.label}</span>
                    </div>
                    {i.localisation && <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 'var(--space-2)' }}>📍 {i.localisation}</p>}
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginBottom: 'var(--space-3)' }}>{i.description}</p>
                    {i.photos && i.photos.length > 0 && (
                      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                        {i.photos.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={`Photo ${idx + 1}`} style={{ height: 60, width: 60, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                          </a>
                        ))}
                      </div>
                    )}
                    {i.commentaireAdmin && (
                      <div style={{ background: 'var(--info-container)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-4)', fontSize: '0.85rem', color: 'var(--info)' }}>
                        <strong>💬 Réponse de la gestion :</strong> {i.commentaireAdmin}
                      </div>
                    )}
                    { (i.dateInterventionEstimee || i.dateCloture || i.montantLocataire != null || i.montantProprietaire != null) && (
                      <div style={{ padding: 'var(--space-3)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                          {i.dateInterventionEstimee && <p><strong>📅 Date estimée:</strong> {new Date(i.dateInterventionEstimee).toLocaleDateString('fr-BE')}</p>}
                          {i.dateCloture && <p><strong>🏁 Date de clôture:</strong> {new Date(i.dateCloture).toLocaleDateString('fr-BE')}</p>}
                          {i.montantLocataire != null && <p><strong>💰 À votre charge:</strong> {i.montantLocataire.toFixed(2)} €</p>}
                          {i.montantProprietaire != null && <p><strong>🏢 À charge proprio:</strong> {i.montantProprietaire.toFixed(2)} €</p>}
                        </div>
                      </div>
                    )}
                    <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', marginTop: 'var(--space-3)' }}>
                      Soumise le {new Date(i.createdAt).toLocaleDateString('fr-BE')} · Mise à jour : {new Date(i.updatedAt).toLocaleDateString('fr-BE')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
