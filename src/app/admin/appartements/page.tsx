'use client'
import { useEffect, useState } from 'react'

interface Appartement { id: number; numero: string; bloc: string; peb: string | null; ean: string | null; etage: number; type: string; surface: number; loyerMensuel: number; chargeMensuelle: number; description: string | null; disponible: boolean; locataire: { nom: string; prenom: string } | null }

export default function AdminAppartements() {
  const [apts, setApts] = useState<Appartement[]>([])
  const [editApt, setEditApt] = useState<Appartement | null>(null)
  const [form, setForm] = useState({ loyerMensuel: 0, chargeMensuelle: 0, description: '', type: '', etage: 0, surface: 0, peb: '', ean: '' })
  const [msg, setMsg] = useState('')

  useEffect(() => { fetch('/api/admin/appartements').then(r => r.json()).then(setApts) }, [])

  const openEdit = (a: Appartement) => { setEditApt(a); setForm({ loyerMensuel: a.loyerMensuel, chargeMensuelle: a.chargeMensuelle, description: a.description || '', type: a.type || '', etage: a.etage || 0, surface: a.surface || 0, peb: a.peb || '', ean: a.ean || '' }) }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editApt) return
    const res = await fetch(`/api/admin/appartements/${editApt.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { const d = await res.json(); setApts(prev => prev.map(a => a.id === editApt.id ? { ...a, ...d } : a)); setMsg('✅ Appartement mis à jour.'); setEditApt(null); setTimeout(() => setMsg(''), 4000) }
  }

  const byBloc: Record<string, Appartement[]> = {}
  apts.forEach(a => { if (!byBloc[a.bloc]) byBloc[a.bloc] = []; byBloc[a.bloc].push(a) })

  return (
    <div>
      <header className="page-header">
        <h1>🏢 Gestion des appartements</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <span className="chip chip-success">✅ {apts.filter(a => a.locataire).length} occupés</span>
          <span className="chip chip-neutral">🏗️ {apts.filter(a => !a.locataire).length} libres</span>
        </div>
      </header>
      <div className="page-body">
        {msg && <div className="alert alert-success">{msg}</div>}

        {editApt && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditApt(null) }}>
            <div className="modal">
              <div className="modal-header">
                <h3>✏️ Modifier l&apos;appartement {editApt.numero}</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditApt(null)}>✕</button>
              </div>
              <form onSubmit={save}>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group"><label className="form-label">Type</label><input type="text" className="form-input" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} required /></div>
                    <div className="form-group"><label className="form-label">PEB</label>
                      <select className="form-select" value={form.peb} onChange={e => setForm(f => ({...f, peb: e.target.value}))}>
                        <option value="">— Non défini —</option>
                        <option value="A+">A+</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option><option value="F">F</option><option value="G">G</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group"><label className="form-label">Étage</label><input type="number" className="form-input" value={form.etage} onChange={e => setForm(f => ({...f, etage: parseInt(e.target.value) || 0}))} required /></div>
                    <div className="form-group"><label className="form-label">Surface (m²)</label><input type="number" className="form-input" value={form.surface} onChange={e => setForm(f => ({...f, surface: parseFloat(e.target.value) || 0}))} required /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Numéro EAN (Compteur électrique)</label><input type="text" className="form-input" value={form.ean} onChange={e => setForm(f => ({...f, ean: e.target.value}))} placeholder="Ex: 5414488..." /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group"><label className="form-label">Loyer mensuel (€)</label><input type="number" className="form-input" value={form.loyerMensuel} onChange={e => setForm(f => ({...f, loyerMensuel: parseFloat(e.target.value)}))} required /></div>
                    <div className="form-group"><label className="form-label">Charges mensuelles (€)</label><input type="number" className="form-input" value={form.chargeMensuelle} onChange={e => setForm(f => ({...f, chargeMensuelle: parseFloat(e.target.value)}))} required /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} /></div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setEditApt(null)}>Annuler</button>
                  <button type="submit" className="btn btn-primary">💾 Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {Object.entries(byBloc).sort().map(([bloc, list]) => (
          <section key={bloc} style={{ marginBottom: 'var(--space-8)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              🏘️ Bloc {bloc}
              <span className="chip chip-neutral" style={{ fontWeight: 400 }}>{list.length} appartements</span>
            </h2>
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>N°</th><th>Type</th><th>PEB</th><th>EAN</th><th>Étage</th><th>Surface</th><th>Loyer</th><th>Charges</th><th>Total</th><th>Locataire</th><th>Action</th></tr></thead>
                <tbody>
                  {list.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{a.numero}</td>
                      <td><span className="chip chip-neutral">{a.type}</span></td>
                      <td>{a.peb ? <span className="chip" style={{ background: a.peb.startsWith('A') ? '#4caf50' : a.peb === 'B' ? '#8bc34a' : a.peb === 'C' ? '#cddc39' : a.peb === 'D' ? '#ffeb3b' : a.peb === 'E' ? '#ffc107' : a.peb === 'F' ? '#ff9800' : '#f44336', color: '#000', fontWeight: 'bold' }}>{a.peb}</span> : '—'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{a.ean || '—'}</td>
                      <td>{a.etage === 0 ? 'RDC' : `${a.etage}e`}</td>
                      <td>{a.surface} m²</td>
                      <td>{a.loyerMensuel} €</td>
                      <td>{a.chargeMensuelle} €</td>
                      <td style={{ fontWeight: 700 }}>{(a.loyerMensuel + a.chargeMensuelle)} €</td>
                      <td>{a.locataire ? <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.locataire.prenom} {a.locataire.nom}</span> : <span className="chip chip-success">Libre</span>}</td>
                      <td><button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}>✏️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
