'use client'
import { useEffect, useState } from 'react'

interface Intervention { id: number; categorie: string; description: string; statut: string; priorite: string; commentaireAdmin: string | null; localisation?: string | null; photos?: string[]; createdAt: string; locataire: { nom: string; prenom: string; appartement: { numero: string } | null } | null }

const catLabel: Record<string, string> = { PLOMBERIE: '🚿 Plomberie', ELECTRICITE: '⚡ Électricité', CHAUFFAGE: '🔥 Chauffage', MENUISERIE: '🪵 Menuiserie', SERRURERIE: '🔑 Serrurerie', PEINTURE: '🎨 Peinture', NETTOYAGE: '🧹 Nettoyage', AUTRE: '🔧 Autre' }
const statutChip: Record<string, string> = { SOUMISE: 'chip-neutral', EN_COURS: 'chip-warning', RESOLUE: 'chip-success', ANNULEE: 'chip-error' }
const prioriteChip: Record<string, string> = { BASSE: 'chip-info', NORMALE: 'chip-neutral', URGENTE: 'chip-error' }

export default function AdminInterventions() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [locataires, setLocataires] = useState<{ id: number; prenom: string; nom: string; appartement: { numero: string } | null }[]>([])
  const [editI, setEditI] = useState<Intervention | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ locataireId: '', categorie: 'PLOMBERIE', priorite: 'NORMALE', description: '' })
  const [statut, setStatut] = useState(''); const [commentaire, setCommentaire] = useState(''); const [priorite, setPriorite] = useState(''); const [categorie, setCategorie] = useState(''); const [description, setDescription] = useState('')
  const [filtre, setFiltre] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => { 
    fetch('/api/admin/interventions').then(r => r.json()).then(setInterventions)
    fetch('/api/admin/locataires').then(r => r.json()).then(setLocataires)
  }, [])

  const openEdit = (i: Intervention) => { setEditI(i); setStatut(i.statut); setCommentaire(i.commentaireAdmin || ''); setPriorite(i.priorite); setCategorie(i.categorie); setDescription(i.description); }

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/interventions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createForm) })
    if (res.ok) {
      const novI = await res.json()
      setInterventions(prev => [novI, ...prev])
      setMsg('✅ Demande ajoutée avec succès.')
      setShowCreate(false)
      setCreateForm({ locataireId: '', categorie: 'PLOMBERIE', priorite: 'NORMALE', description: '' })
      setTimeout(() => setMsg(''), 4000)
    }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editI) return
    const res = await fetch(`/api/admin/interventions/${editI.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statut, commentaireAdmin: commentaire, priorite, categorie, description }) })
    if (res.ok) {
      setInterventions(prev => prev.map(i => i.id === editI.id ? { ...i, statut, commentaireAdmin: commentaire, priorite, categorie, description } : i))
      setMsg('✅ Intervention mise à jour.'); setEditI(null)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  const deleteInt = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette intervention ?")) return
    const res = await fetch(`/api/admin/interventions/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setInterventions(prev => prev.filter(i => i.id !== id))
      setMsg('✅ Intervention supprimée.')
      setTimeout(() => setMsg(''), 4000)
    }
  }

  const filtered = filtre ? interventions.filter(i => i.statut === filtre) : interventions

  return (
    <div>
      <header className="page-header">
        <h1>🔧 Gestion des interventions</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>➕ Nouvelle intervention</button>
      </header>
      <div className="page-body">
        {msg && <div className="alert alert-success">{msg}</div>}

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
          {['', 'SOUMISE', 'EN_COURS', 'RESOLUE', 'ANNULEE'].map(s => (
            <button key={s} className={`btn btn-sm ${filtre === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltre(s)}>
              {s === '' ? 'Toutes' : s === 'SOUMISE' ? '📬 Soumises' : s === 'EN_COURS' ? '⚙️ En cours' : s === 'RESOLUE' ? '✅ Résolues' : '❌ Annulées'}
            </button>
          ))}
        </div>

        {showCreate && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false) }}>
            <div className="modal">
              <div className="modal-header">
                <h3>➕ Créer une intervention</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>✕</button>
              </div>
              <form onSubmit={submitCreate}>
                <div className="modal-body">
                  <div className="form-group"><label className="form-label">Lieu / Concerne</label>
                    <select className="form-select" value={createForm.locataireId} onChange={e => setCreateForm(f => ({...f, locataireId: e.target.value}))}>
                      <option value="">🏢 Immeuble / Général</option>
                      {locataires.map(l => (
                         <option key={l.id} value={l.id}>{l.prenom} {l.nom} {l.appartement ? `(Apt. ${l.appartement.numero})` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Catégorie</label>
                    <select className="form-select" value={createForm.categorie} onChange={e => setCreateForm(f => ({...f, categorie: e.target.value}))}>
                      {Object.keys(catLabel).map(k => <option key={k} value={k}>{catLabel[k]}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Priorité</label>
                    <select className="form-select" value={createForm.priorite} onChange={e => setCreateForm(f => ({...f, priorite: e.target.value}))}>
                      <option value="BASSE">🟢 Basse</option>
                      <option value="NORMALE">🟡 Normale</option>
                      <option value="URGENTE">🔴 Urgente</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Description du problème</label>
                    <textarea className="form-textarea" value={createForm.description} onChange={e => setCreateForm(f => ({...f, description: e.target.value}))} rows={4} required />
                  </div>
                </div>
                <div className="modal-footer">
                   <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Annuler</button>
                   <button type="submit" className="btn btn-primary">➕ Créer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editI && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditI(null) }}>
            <div className="modal">
              <div className="modal-header">
                <h3>⚙️ Traiter l&apos;intervention #{editI.id}</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditI(null)}>✕</button>
              </div>
              <form onSubmit={save}>
                <div className="modal-body">
                  <div style={{ background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{editI.locataire ? `${editI.locataire.prenom} ${editI.locataire.nom} (Apt. ${editI.locataire.appartement?.numero || '?'})` : '🏢 Immeuble Général'}</p>
                    {editI.localisation && <p style={{ fontSize: '0.85rem', marginTop: 'var(--space-2)' }}>📍 Localisation: {editI.localisation}</p>}
                    {editI.photos && editI.photos.length > 0 && (
                      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {editI.photos.map((url, idx) => (
                           <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                             <img src={url} alt={`Photo ${idx + 1}`} style={{ height: 50, width: 50, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                           </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="form-group"><label className="form-label">Catégorie</label>
                    <select className="form-select" value={categorie} onChange={e => setCategorie(e.target.value)}>
                      {Object.keys(catLabel).map(k => <option key={k} value={k}>{catLabel[k]}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Description du problème</label>
                    <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} rows={3} required />
                  </div>
                  <div className="form-group"><label className="form-label">Statut</label>
                    <select className="form-select" value={statut} onChange={e => setStatut(e.target.value)}>
                      <option value="SOUMISE">📬 Soumise</option>
                      <option value="EN_COURS">⚙️ En cours</option>
                      <option value="RESOLUE">✅ Résolue</option>
                      <option value="ANNULEE">❌ Annulée</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Priorité</label>
                    <select className="form-select" value={priorite} onChange={e => setPriorite(e.target.value)}>
                      <option value="BASSE">🟢 Basse</option>
                      <option value="NORMALE">🟡 Normale</option>
                      <option value="URGENTE">🔴 Urgente</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Commentaire / Réponse au locataire</label>
                    <textarea className="form-textarea" value={commentaire} onChange={e => setCommentaire(e.target.value)} placeholder="Ex: Le technicien viendra le 5 avril..." rows={4} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setEditI(null)}>Annuler</button>
                  <button type="submit" className="btn btn-primary">💾 Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Locataire</th><th>Apt.</th><th>Lieu</th><th>Catégorie</th><th>Description</th><th>Priorité</th><th>Statut</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(i => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600 }}>{i.locataire ? `${i.locataire.prenom} ${i.locataire.nom}` : <span className="chip chip-info" style={{ fontSize: '0.7rem' }}>Immeuble</span>}</td>
                  <td>{i.locataire?.appartement ? <span className="chip chip-primary" style={{ fontSize: '0.7rem' }}>{i.locataire.appartement.numero}</span> : '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{i.localisation || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{catLabel[i.categorie]}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', maxWidth: '200px' }}>{i.description.slice(0, 80)}{i.description.length > 80 ? '...' : ''}</td>
                  <td><span className={`chip ${prioriteChip[i.priorite]}`}>{i.priorite}</span></td>
                  <td><span className={`chip ${statutChip[i.statut]}`}>{i.statut}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>{new Date(i.createdAt).toLocaleDateString('fr-BE')}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(i)} title="Modifier">✎</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteInt(i.id)} title="Supprimer">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
