'use client'
import { useEffect, useState } from 'react'

interface Locataire { id: number; prenom: string; nom: string; email: string; telephone: string | null; actif: boolean; dateEcheanceBail: string | null; garantieLocative: number | null; appartement: { numero: string } | null; paiements: { statut: string }[] }
interface Appartement { id: number; numero: string; bloc: string; locataire: null | object }

export default function AdminLocataires() {
  const [locataires, setLocataires] = useState<Locataire[]>([])
  const [appartements, setAppartements] = useState<Appartement[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<Locataire | null>(null)
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', telephone: '', appartementId: '', dateEcheanceBail: '', garantieLocative: '', actif: true })
  const [msg, setMsg] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: 'appartement' | 'dateEcheanceBail', direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: 'appartement' | 'dateEcheanceBail') => {
    setSortConfig(prev => prev?.key === key && prev.direction === 'asc' ? { key, direction: 'desc' } : { key, direction: 'asc' })
  }

  useEffect(() => {
    fetch('/api/admin/locataires').then(r => r.json()).then(setLocataires)
    fetch('/api/admin/appartements').then(r => r.json()).then(setAppartements)
  }, [])

  const aptsLibres = appartements.filter(a => !a.locataire)

  const openCreate = () => { setEditUser(null); setForm({ prenom: '', nom: '', email: '', telephone: '', appartementId: '', dateEcheanceBail: '', garantieLocative: '', actif: true }); setShowForm(true) }
  const openEdit = (l: Locataire) => { setEditUser(l); setForm({ prenom: l.prenom, nom: l.nom, email: l.email, telephone: l.telephone || '', appartementId: l.appartement ? String(appartements.find(a => a.numero === l.appartement!.numero)?.id || '') : '', dateEcheanceBail: l.dateEcheanceBail ? l.dateEcheanceBail.substring(0, 10) : '', garantieLocative: l.garantieLocative ? String(l.garantieLocative) : '', actif: l.actif }); setShowForm(true) }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editUser) {
      const res = await fetch(`/api/admin/locataires/${editUser.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, appartementId: form.appartementId ? parseInt(form.appartementId) : null }) })
      if (res.ok) { const d = await res.json(); setLocataires(prev => prev.map(l => l.id === editUser.id ? { ...l, ...d } : l)); setMsg('✅ Locataire mis à jour.'); setShowForm(false) }
    } else {
      const res = await fetch('/api/admin/locataires', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, appartementId: form.appartementId ? parseInt(form.appartementId) : null }) })
      if (res.ok) { fetch('/api/admin/locataires').then(r => r.json()).then(setLocataires); setMsg('✅ Locataire créé.'); setShowForm(false) }
      else { const d = await res.json(); setMsg(`❌ ${d.error}`) }
    }
    setTimeout(() => setMsg(''), 5000)
  }

  const toggleActif = async (l: Locataire) => {
    const res = await fetch(`/api/admin/locataires/${l.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actif: !l.actif }) })
    if (res.ok) setLocataires(prev => prev.map(x => x.id === l.id ? { ...x, actif: !l.actif } : x))
  }

  const filtered = locataires.filter(l => `${l.prenom} ${l.nom} ${l.email}`.toLowerCase().includes(search.toLowerCase()))
  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig) return 0;
    if (sortConfig.key === 'appartement') {
      const aNum = a.appartement?.numero || ''
      const bNum = b.appartement?.numero || ''
      return sortConfig.direction === 'asc' ? aNum.localeCompare(bNum) : bNum.localeCompare(aNum)
    }
    if (sortConfig.key === 'dateEcheanceBail') {
      const aDate = a.dateEcheanceBail || '9999-12-31'
      const bDate = b.dateEcheanceBail || '9999-12-31'
      return sortConfig.direction === 'asc' ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate)
    }
    return 0;
  })

  return (
    <div>
      <header className="page-header">
        <h1>👥 Gestion des locataires</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>➕ Nouveau locataire</button>
      </header>
      <div className="page-body">
        {msg && <div className={`alert alert-${msg.startsWith('✅') ? 'success' : 'error'}`}>{msg}</div>}

        <div style={{ marginBottom: 'var(--space-5)' }}>
          <input className="form-input" style={{ maxWidth: '360px' }} placeholder="🔍 Rechercher un locataire..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
            <div className="modal">
              <div className="modal-header">
                <h3>{editUser ? '✏️ Modifier' : '➕ Nouveau'} locataire</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form onSubmit={save}>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group"><label className="form-label">Prénom</label><input className="form-input" value={form.prenom} onChange={e => setForm(f => ({...f, prenom: e.target.value}))} required /></div>
                    <div className="form-group"><label className="form-label">Nom</label><input className="form-input" value={form.nom} onChange={e => setForm(f => ({...f, nom: e.target.value}))} required /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required disabled={!!editUser} /></div>
                    <div className="form-group"><label className="form-label">Téléphone</label><input className="form-input" value={form.telephone} onChange={e => setForm(f => ({...f, telephone: e.target.value}))} placeholder="+32 4XX XX XX XX" /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group"><label className="form-label">Échéance de bail</label><input type="date" className="form-input" value={form.dateEcheanceBail} onChange={e => setForm(f => ({...f, dateEcheanceBail: e.target.value}))} /></div>
                    <div className="form-group"><label className="form-label">Garantie locative (€)</label><input type="number" step="0.01" className="form-input" value={form.garantieLocative} onChange={e => setForm(f => ({...f, garantieLocative: e.target.value}))} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                      <label className="form-label">Appartement</label>
                      <select className="form-select" value={form.appartementId} onChange={e => setForm(f => ({...f, appartementId: e.target.value}))}>
                        <option value="">— Aucun appartement —</option>
                        {editUser?.appartement && <option value={String(appartements.find(a => a.numero === editUser.appartement!.numero)?.id || '')}>{editUser.appartement.numero} (actuel)</option>}
                        {aptsLibres.map(a => <option key={a.id} value={String(a.id)}>Apt. {a.numero} (libre)</option>)}
                      </select>
                    </div>
                    {editUser && (
                      <div className="form-group">
                        <label className="form-label">Statut</label>
                        <select className="form-select" value={form.actif ? 'ACTIF' : 'INACTIF'} onChange={e => setForm(f => ({...f, actif: e.target.value === 'ACTIF'}))}>
                          <option value="ACTIF">🟢 Actif</option>
                          <option value="INACTIF">🔴 Inactif</option>
                        </select>
                      </div>
                    )}
                  </div>
                  {!editUser && <div className="alert alert-info" style={{ fontSize: '0.8rem' }}>🔑 Mot de passe par défaut : <strong>Locataire2026!</strong></div>}
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
            <thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th><th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('appartement')}>Appartement {sortConfig?.key === 'appartement' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</th><th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('dateEcheanceBail')}>Échéance Bail {sortConfig?.key === 'dateEcheanceBail' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {sorted.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.prenom} {l.nom}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--on-surface-muted)' }}>{l.email}</td>
                  <td style={{ fontSize: '0.85rem' }}>{l.telephone || '—'}</td>
                  <td>{l.appartement ? <span className="chip chip-primary">🏠 {l.appartement.numero}</span> : <span className="chip chip-neutral">Non attribué</span>}</td>
                  <td style={{ fontSize: '0.85rem' }}>{l.dateEcheanceBail ? new Date(l.dateEcheanceBail).toLocaleDateString('fr-BE') : '—'}</td>
                  <td><span className={`chip ${l.actif ? 'chip-success' : 'chip-error'}`}>{l.actif ? '✅ Actif' : '❌ Désactivé'}</span></td>
                  <td style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(l)}>✏️</button>
                    <button className={`btn btn-sm ${l.actif ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleActif(l)}>{l.actif ? '🚫' : '✅'}</button>
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
