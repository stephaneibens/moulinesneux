'use client'
import { useEffect, useState } from 'react'

interface Locataire { id: number; prenom: string; nom: string; email: string; appartement: { numero: string } | null }
interface Paiement { id: number; type: string; montant: number; periode: string | null; statut: string; datePaiement: string | null; notes: string | null; locataire: { nom: string; prenom: string; email: string; appartement: { numero: string } | null } }

const statutInfo: Record<string, { label: string; chip: string }> = {
  PAYE: { label: '✅ Payé', chip: 'chip-success' },
  EN_ATTENTE: { label: '⏳ En attente', chip: 'chip-warning' },
  RETARD: { label: '🔴 Retard', chip: 'chip-error' },
}

export default function AdminPaiements() {
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [locataires, setLocataires] = useState<Locataire[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ locataireId: '', type: 'LOYER', montant: '', periode: '', statut: 'EN_ATTENTE', notes: '' })
  const [editPaiement, setEditPaiement] = useState<Paiement | null>(null)
  const [editForm, setEditForm] = useState({ type: 'LOYER', montant: '', periode: '', statut: 'EN_ATTENTE', notes: '', datePaiement: '' })
  const [filtre, setFiltre] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('datePaiement')
  const [sortDir, setSortDir] = useState(1) // 1: desc, -1: asc
  const [selected, setSelected] = useState<number[]>([])
  const [generating, setGenerating] = useState(false)
  const [updating, setUpdating] = useState<number | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => { 
    fetch('/api/admin/paiements').then(r => r.json()).then(setPaiements)
    fetch('/api/admin/locataires').then(r => r.json()).then(setLocataires)
  }, [])

  const updateStatut = async (id: number, statut: string) => {
    setUpdating(id)
    const res = await fetch(`/api/admin/paiements/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statut }) })
    if (res.ok) {
      const d = await res.json()
      setPaiements(prev => prev.map(p => p.id === id ? { ...p, statut: d.statut, datePaiement: d.datePaiement } : p))
      setMsg('✅ Paiement mis à jour.')
      setTimeout(() => setMsg(''), 3000)
    }
    setUpdating(null)
  }

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/paiements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createForm) })
    if (res.ok) {
      const novP = await res.json()
      setPaiements(prev => [novP, ...prev])
      setMsg('✅ Paiement ajouté avec succès.')
      setShowCreate(false)
      setCreateForm({ locataireId: '', type: 'LOYER', montant: '', periode: '', statut: 'EN_ATTENTE', notes: '' })
      setTimeout(() => setMsg(''), 4000)
    }
  }

  const openEdit = (p: Paiement) => {
    setEditPaiement(p)
    setEditForm({
      type: p.type,
      montant: String(p.montant),
      periode: p.periode || '',
      statut: p.statut,
      notes: p.notes || '',
      datePaiement: p.datePaiement ? p.datePaiement.substring(0, 10) : ''
    })
  }

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editPaiement) return
    const body = { type: editForm.type, montant: parseFloat(editForm.montant), periode: editForm.periode, statut: editForm.statut, notes: editForm.notes, datePaiement: editForm.datePaiement ? new Date(editForm.datePaiement).toISOString() : null }
    const res = await fetch(`/api/admin/paiements/${editPaiement.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      const d = await res.json()
      setPaiements(prev => prev.map(p => p.id === editPaiement.id ? { ...p, ...d } : p))
      setMsg('✅ Paiement modifié avec succès.')
      setEditPaiement(null)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  const deletePaiement = async (id: number) => {
    if (!confirm('Supprimer ce paiement ?')) return
    const res = await fetch(`/api/admin/paiements/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPaiements(prev => prev.filter(p => p.id !== id))
      setSelected(prev => prev.filter(sid => sid !== id))
      setMsg('✅ Paiement supprimé.')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const deleteSelected = async () => {
    if (!selected.length || !confirm(`Supprimer ${selected.length} paiements ?`)) return
    const res = await fetch(`/api/admin/paiements/bulk`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selected }) })
    if (res.ok) {
      setPaiements(prev => prev.filter(p => !selected.includes(p.id)))
      setSelected([])
      setMsg(`✅ ${selected.length} paiements supprimés.`)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const generateLoyer = async () => {
    setGenerating(true)
    const res = await fetch('/api/admin/paiements/generate', { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      if (data.count > 0) {
         setMsg(`✅ ${data.count} loyers générés pour ${data.periode}.`)
         fetch('/api/admin/paiements').then(r => r.json()).then(setPaiements)
      } else {
         setMsg(`ℹ️ Aucun nouveau loyer à générer pour ${data.periode}.`)
      }
      setTimeout(() => setMsg(''), 4000)
    }
    setGenerating(false)
  }

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  let filtered = paiements.filter(p => {
    const matchStatut = !filtre || p.statut === filtre
    const matchSearch = !search || `${p.locataire.prenom} ${p.locataire.nom} ${p.locataire.email} ${p.periode} ${p.type}`.toLowerCase().includes(search.toLowerCase())
    return matchStatut && matchSearch
  })
  
  filtered.sort((a, b) => {
    let valA: string | number = ''; let valB: string | number = ''
    if (sortKey === 'locataire') { valA = `${a.locataire.prenom} ${a.locataire.nom}`; valB = `${b.locataire.prenom} ${b.locataire.nom}` }
    else if (sortKey === 'periode') { valA = a.periode || ''; valB = b.periode || '' }
    else if (sortKey === 'type') { valA = a.type; valB = b.type }
    else if (sortKey === 'statut') { valA = a.statut; valB = b.statut }
    else if (sortKey === 'datePaiement') { valA = a.datePaiement || a.periode || ''; valB = b.datePaiement || b.periode || '' }
    else if (sortKey === 'montant') { valA = a.montant; valB = b.montant }
    
    if (valA < valB) return sortDir
    if (valA > valB) return -sortDir
    return 0
  })

  const totalPaye = paiements.filter(p => p.statut === 'PAYE').reduce((s, p) => s + p.montant, 0)
  const totalAttente = paiements.filter(p => p.statut !== 'PAYE').reduce((s, p) => s + p.montant, 0)

  return (
    <div>
      <header className="page-header">
        <h1>💳 Gestion des paiements</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary btn-sm" onClick={generateLoyer} disabled={generating}>{generating ? '⏳ Génération...' : '💵 Générer loyers du mois prochain'}</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>➕ Nouveau paiement / facture</button>
        </div>
      </header>
      <div className="page-body">
        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 'var(--space-6)' }}>
          <div className="stat-card"><div className="stat-icon success">💰</div><div className="stat-content"><p className="stat-label">Total encaissé</p><p className="stat-value" style={{ fontSize: '1.4rem' }}>{totalPaye.toFixed(0)}€</p></div></div>
          <div className="stat-card"><div className="stat-icon error">🔴</div><div className="stat-content"><p className="stat-label">En retard</p><p className="stat-value" style={{ fontSize: '1.4rem' }}>{paiements.filter(p => p.statut === 'RETARD').reduce((s, p) => s + p.montant, 0).toFixed(0)}€</p></div></div>
          <div className="stat-card"><div className="stat-icon warning">⏳</div><div className="stat-content"><p className="stat-label">En attente</p><p className="stat-value" style={{ fontSize: '1.4rem' }}>{paiements.filter(p => p.statut === 'EN_ATTENTE').reduce((s, p) => s + p.montant, 0).toFixed(0)}€</p></div></div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-input" style={{ maxWidth: '280px' }} placeholder="🔍 Rechercher (nom, info)..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-select" style={{ maxWidth: '200px' }} value={filtre} onChange={e => setFiltre(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="PAYE">✅ Payés</option>
            <option value="EN_ATTENTE">⏳ En attente</option>
            <option value="RETARD">🔴 En retard</option>
          </select>
          {selected.length > 0 && <button className="btn btn-danger btn-sm" onClick={deleteSelected}>🗑️ Supprimer {selected.length} paiements</button>}
        </div>

        {showCreate && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false) }}>
            <div className="modal">
              <div className="modal-header">
                <h3>➕ Enregistrer une transaction</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>✕</button>
              </div>
              <form onSubmit={submitCreate}>
                <div className="modal-body">
                  <div className="form-group"><label className="form-label">Locataire débiteur</label>
                    <select className="form-select" value={createForm.locataireId} onChange={e => setCreateForm(f => ({...f, locataireId: e.target.value}))} required>
                      <option value="">— Sélectionner —</option>
                      {locataires.map(l => (
                         <option key={l.id} value={l.id}>{l.prenom} {l.nom} {l.appartement ? `(Apt. ${l.appartement.numero})` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group"><label className="form-label">Type de paiement</label>
                      <select className="form-select" value={createForm.type} onChange={e => setCreateForm(f => ({...f, type: e.target.value}))}>
                        <option value="LOYER">🏠 Loyer mensuel</option>
                        <option value="CHARGES">💡 Décompte de charges</option>
                        <option value="GARANTIE">🔒 Garantie locative</option>
                        <option value="ETAT_LIEUX">📋 État des lieux</option>
                        <option value="INDEMNITE">⚠️ Indemnité / Amendes</option>
                        <option value="AUTRE">➕ Autre</option>
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Montant (€)</label>
                      <input type="number" step="0.01" className="form-input" value={createForm.montant} onChange={e => setCreateForm(f => ({...f, montant: e.target.value}))} required />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group"><label className="form-label">Période (optionnel)</label>
                      <input className="form-input" placeholder="Ex: Avril 2026" value={createForm.periode} onChange={e => setCreateForm(f => ({...f, periode: e.target.value}))} />
                    </div>
                    <div className="form-group"><label className="form-label">Statut initial</label>
                      <select className="form-select" value={createForm.statut} onChange={e => setCreateForm(f => ({...f, statut: e.target.value}))}>
                        <option value="EN_ATTENTE">⏳ En attente</option>
                        <option value="PAYE">✅ Déjà Payé</option>
                        <option value="RETARD">🔴 En retard</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label className="form-label">Note / Réf (optionnel)</label>
                    <input className="form-input" value={createForm.notes} onChange={e => setCreateForm(f => ({...f, notes: e.target.value}))} />
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

        {editPaiement && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditPaiement(null) }}>
            <div className="modal">
              <div className="modal-header">
                <h3>✏️ Modifier la transaction</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditPaiement(null)}>✕</button>
              </div>
              <form onSubmit={submitEdit}>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group"><label className="form-label">Type de paiement</label>
                      <select className="form-select" value={editForm.type} onChange={e => setEditForm(f => ({...f, type: e.target.value}))}>
                        <option value="LOYER">🏠 Loyer mensuel</option>
                        <option value="CHARGES">💡 Décompte de charges</option>
                        <option value="GARANTIE">🔒 Garantie locative</option>
                        <option value="ETAT_LIEUX">📋 État des lieux</option>
                        <option value="INDEMNITE">⚠️ Indemnité / Amendes</option>
                        <option value="AUTRE">➕ Autre</option>
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Montant (€)</label>
                      <input type="number" step="0.01" className="form-input" value={editForm.montant} onChange={e => setEditForm(f => ({...f, montant: e.target.value}))} required />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group"><label className="form-label">Période (optionnel)</label>
                      <input className="form-input" placeholder="Ex: Avril 2026" value={editForm.periode} onChange={e => setEditForm(f => ({...f, periode: e.target.value}))} />
                    </div>
                    <div className="form-group"><label className="form-label">Statut</label>
                      <select className="form-select" value={editForm.statut} onChange={e => setEditForm(f => ({...f, statut: e.target.value}))}>
                        <option value="EN_ATTENTE">⏳ En attente</option>
                        <option value="PAYE">✅ Payé</option>
                        <option value="RETARD">🔴 En retard</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group"><label className="form-label">Date Paiement</label>
                      <input type="date" className="form-input" value={editForm.datePaiement} onChange={e => setEditForm(f => ({...f, datePaiement: e.target.value}))} />
                    </div>
                    <div className="form-group"><label className="form-label">Note / Réf (optionnel)</label>
                      <input className="form-input" value={editForm.notes} onChange={e => setEditForm(f => ({...f, notes: e.target.value}))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                   <button type="button" className="btn btn-ghost" onClick={() => setEditPaiement(null)}>Annuler</button>
                   <button type="submit" className="btn btn-primary">💾 Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-wrapper">
          <table className="table">
            <thead><tr>
              <th style={{ width: '40px' }}><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={e => e.target.checked ? setSelected(filtered.map(f => f.id)) : setSelected([])} /></th>
              <th onClick={() => handleSort('locataire')} style={{ cursor: 'pointer' }}>Locataire {sortKey === 'locataire' && (sortDir === -1 ? '🠝' : '🠟')}</th>
              <th>Apt.</th>
              <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>Type {sortKey === 'type' && (sortDir === -1 ? '🠝' : '🠟')}</th>
              <th onClick={() => handleSort('periode')} style={{ cursor: 'pointer' }}>Période {sortKey === 'periode' && (sortDir === -1 ? '🠝' : '🠟')}</th>
              <th onClick={() => handleSort('montant')} style={{ cursor: 'pointer' }}>Montant {sortKey === 'montant' && (sortDir === -1 ? '🠝' : '🠟')}</th>
              <th onClick={() => handleSort('datePaiement')} style={{ cursor: 'pointer' }}>Date paiement {sortKey === 'datePaiement' && (sortDir === -1 ? '🠝' : '🠟')}</th>
              <th onClick={() => handleSort('statut')} style={{ cursor: 'pointer' }}>Statut {sortKey === 'statut' && (sortDir === -1 ? '🠝' : '🠟')}</th>
              <th>Action</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><input type="checkbox" checked={selected.includes(p.id)} onChange={e => e.target.checked ? setSelected([...selected, p.id]) : setSelected(selected.filter(id => id !== p.id))} /></td>
                  <td style={{ fontWeight: 600 }}>{p.locataire.prenom} {p.locataire.nom}</td>
                  <td>{p.locataire.appartement ? <span className="chip chip-primary" style={{ fontSize: '0.7rem' }}>{p.locataire.appartement.numero}</span> : '—'}</td>
                  <td style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{p.type === 'LOYER' ? 'DOMICILIATION' : p.type === 'CHARGES' ? 'DÉCOMPTE' : p.type}</td>
                  <td>{p.periode || '—'}</td>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{p.montant.toFixed(2)} €</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--on-surface-muted)' }}>{p.datePaiement ? new Date(p.datePaiement).toLocaleDateString('fr-BE') : '—'}</td>
                  <td><span className={`chip ${statutInfo[p.statut]?.chip || 'chip-neutral'}`}>{statutInfo[p.statut]?.label || p.statut}</span></td>
                  <td style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {p.statut !== 'PAYE' && (
                      <button className="btn btn-success btn-sm" disabled={updating === p.id} onClick={() => updateStatut(p.id, 'PAYE')} title="Marquer payé">
                        {updating === p.id ? '⏳' : '✅'}
                      </button>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)} title="Modifier">✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deletePaiement(p.id)} title="Supprimer">🗑️</button>
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
