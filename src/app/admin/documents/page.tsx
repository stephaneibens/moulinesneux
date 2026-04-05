"use client";
import { useEffect, useState } from 'react'
import { Dropzone } from '@/components/ui/Dropzone'

interface Document { id: number; nom: string; type: string; description: string | null; url: string; commun: boolean; createdAt: string; locataire: { nom: string; prenom: string } | null }
interface Locataire { id: number; nom: string; prenom: string }

const typeLabel: Record<string, string> = { BAIL: '📜 Bail', AVIS: '📋 Avis', REGLEMENT: '📖 Règlement', FACTURE: '🧾 Facture', AUTRE: '📄 Autre', ETAT_LIEUX_ENTREE: '🔑 État des lieux entrée', ETAT_LIEUX_SORTIE: '🔑 État des lieux sortie', GARANTIE: '🔒 Garantie locative', DECOMPTE: '💡 Décompte des charges', COURRIER: '✉️ Courrier', ENREGISTREMENT: '📝 Enregistrement' }

export default function AdminDocuments() {
  const [docs, setDocs] = useState<Document[]>([])
  const [locataires, setLocataires] = useState<Locataire[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ id: 0, nom: '', type: 'AVIS', description: '', url: '', commun: true, locataireId: '' })
  const [msg, setMsg] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState(1) // 1: desc, -1: asc

  useEffect(() => {
    fetch('/api/admin/documents').then(r => r.json()).then(setDocs)
    fetch('/api/admin/locataires').then(r => r.json()).then(setLocataires)
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.url) {
      setMsg("❌ Veuillez télécharger un document d'abord.")
      setTimeout(() => setMsg(''), 4000)
      return
    }
    const body = { ...form, commun: form.commun, locataireId: form.locataireId ? parseInt(form.locataireId) : null }
    let res;
    if (form.id) {
      res = await fetch(`/api/admin/documents/${form.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      res = await fetch('/api/admin/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    if (res.ok) { 
      fetch('/api/admin/documents').then(r => r.json()).then(setDocs); 
      setMsg(form.id ? '✅ Document modifié.' : '✅ Document ajouté.'); 
      setForm({ id: 0, nom: '', type: 'AVIS', description: '', url: '', commun: true, locataireId: '' }); 
      setShowForm(false); 
      setTimeout(() => setMsg(''), 4000) 
    } else {
      const errorData = await res.json().catch(() => ({}));
      setMsg(`❌ Erreur serveur: ${errorData.error || 'Erreur inconnue'}`);
      setTimeout(() => setMsg(''), 8000);
    }
  }

  const editDoc = (d: Document) => {
    setForm({
      id: d.id,
      nom: d.nom,
      type: d.type,
      description: d.description || '',
      url: d.url,
      commun: d.commun,
      locataireId: '' // We will find the correct ID below since Document interface doesn't include it
    })
    // we need locataireId, let's search in locataires array to match the name
    if (d.locataire) {
        const l = locataires.find(loc => loc.nom === d.locataire?.nom && loc.prenom === d.locataire?.prenom)
        setForm(prev => ({...prev, locataireId: l ? String(l.id) : ''}))
    }
    setShowForm(true)
  }

  const deleteDoc = async (id: number) => {
    if (!confirm('Supprimer ce document ?')) return
    const res = await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' })
    if (res.ok) { setDocs(prev => prev.filter(d => d.id !== id)) }
  }

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  const filtered = docs.filter(d => {
    if (!search) return true
    const s = search.toLowerCase()
    const labelType = (typeLabel[d.type] || '').toLowerCase()
    const destinataire = d.commun ? 'tous les locataires' : d.locataire ? `${d.locataire.prenom} ${d.locataire.nom}`.toLowerCase() : ''
    return d.nom.toLowerCase().includes(s) || labelType.includes(s) || destinataire.includes(s)
  })

  filtered.sort((a, b) => {
    let valA: string | number = ''; let valB: string | number = ''
    if (sortKey === 'type') { valA = typeLabel[a.type] || ''; valB = typeLabel[b.type] || '' }
    else if (sortKey === 'destinataire') {
      valA = a.commun ? '0' : a.locataire ? `${a.locataire.prenom} ${a.locataire.nom}` : '1'
      valB = b.commun ? '0' : b.locataire ? `${b.locataire.prenom} ${b.locataire.nom}` : '1'
    } else if (sortKey === 'createdAt') { valA = a.createdAt; valB = b.createdAt }
    else { valA = a.nom; valB = b.nom }

    if (valA < valB) return sortDir
    if (valA > valB) return -sortDir
    return 0
  })

  return (
    <div>
      <header className="page-header">
        <h1>📄 Gestion des documents</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ id: 0, nom: '', type: 'AVIS', description: '', url: '', commun: true, locataireId: '' }); setShowForm(true); }}>➕ Ajouter un document</button>
      </header>
      <div className="page-body">
        {msg && <div className="alert alert-success">{msg}</div>}

        <div style={{ marginBottom: 'var(--space-5)' }}>
          <input className="form-input" style={{ maxWidth: '300px' }} placeholder="🔍 Filtrer sur toutes les colonnes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
            <div className="modal">
              <div className="modal-header"><h3>{form.id ? '✎ Modifier le document' : '➕ Nouveau document'}</h3><button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button></div>
              <form onSubmit={save}>
                <div className="modal-body">
                  <div className="form-group"><label className="form-label">Nom du document</label><input className="form-input" value={form.nom} onChange={e => setForm(f => ({...f, nom: e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                      <option value="BAIL">📜 Bail</option><option value="AVIS">📋 Avis</option>
                      <option value="REGLEMENT">📖 Règlement</option><option value="FACTURE">🧾 Facture</option>
                      <option value="ETAT_LIEUX_ENTREE">🔑 État des lieux entrée</option><option value="ETAT_LIEUX_SORTIE">🔑 État des lieux sortie</option>
                      <option value="GARANTIE">🔒 Garantie locative</option><option value="DECOMPTE">💡 Décompte des charges</option>
                      <option value="COURRIER">✉️ Courrier</option><option value="ENREGISTREMENT">📝 Enregistrement</option>
                      <option value="AUTRE">📄 Autre</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Description (optionnel)</label><input className="form-input" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
                  <div className="form-group">
                    <label className="form-label">Fichier</label>
                    {form.url ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius)' }}>
                        <a href={form.url} target="_blank" style={{ color: 'var(--color-primary)', textDecoration: 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          📄 {form.url.split('/').pop()}
                        </a>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(f => ({...f, url: ''}))}>✕</button>
                      </div>
                    ) : (
                      <Dropzone onUpload={(url) => setForm(f => ({...f, url}))} />
                    )}
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.commun} onChange={e => setForm(f => ({...f, commun: e.target.checked, locataireId: ''}))} style={{ width: '18px', height: '18px' }} />
                      <span className="form-label" style={{ margin: 0 }}>Document commun (visible pour tous les locataires)</span>
                    </label>
                  </div>
                  {!form.commun && (
                    <div className="form-group"><label className="form-label">Locataire spécifique</label>
                      <select className="form-select" value={form.locataireId} onChange={e => setForm(f => ({...f, locataireId: e.target.value}))} required>
                        <option value="">— Choisir un locataire —</option>
                        {locataires.map(l => <option key={l.id} value={String(l.id)}>{l.prenom} {l.nom}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary">💾 Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>Type {sortKey === 'type' && (sortDir === -1 ? '🠝' : '🠟')}</th>
                <th onClick={() => handleSort('destinataire')} style={{ cursor: 'pointer' }}>Destinataire {sortKey === 'destinataire' && (sortDir === -1 ? '🠝' : '🠟')}</th>
                <th>P. Jointe</th>
                <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>Date {sortKey === 'createdAt' && (sortDir === -1 ? '🠝' : '🠟')}</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.nom}</td>
                  <td><span className="chip chip-neutral">{typeLabel[d.type]}</span></td>
                  <td>{d.commun ? <span className="chip chip-info" style={{ fontSize: '0.8rem' }}>🌐 Tous les locataires</span> : d.locataire ? <span style={{ fontSize: '0.85rem' }}>{d.locataire.prenom} {d.locataire.nom}</span> : '—'}</td>
                  <td><a href={d.url} target="_blank" className="btn btn-sm btn-secondary" style={{ display: 'inline-flex', padding: '4px 8px' }}>📎 Ouvrir</a></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>{new Date(d.createdAt).toLocaleDateString('fr-BE')}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => editDoc(d)} title="Modifier">✎</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteDoc(d.id)} title="Supprimer">🗑️</button>
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
