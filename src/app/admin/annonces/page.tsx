'use client'
import { useEffect, useState } from 'react'
import { Dropzone } from '@/components/ui/Dropzone'

interface Annonce { id: number; titre: string; contenu: string; priorite: string; visible: boolean; createdAt: string; publiePar: { prenom: string; nom: string }; documentUrl: string | null }

export default function AdminAnnonces() {
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editA, setEditA] = useState<Annonce | null>(null)
  const [form, setForm] = useState({ titre: '', contenu: '', priorite: 'NORMALE', documentUrl: '' })
  const [msg, setMsg] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => { fetch('/api/admin/annonces').then(r => r.json()).then(setAnnonces) }, [])

  const openCreate = () => { setEditA(null); setForm({ titre: '', contenu: '', priorite: 'NORMALE', documentUrl: '' }); setShowForm(true) }
  const openEdit = (a: Annonce) => { setEditA(a); setForm({ titre: a.titre, contenu: a.contenu, priorite: a.priorite, documentUrl: a.documentUrl || '' }); setShowForm(true) }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editA) {
      const res = await fetch(`/api/admin/annonces/${editA.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, visible: editA.visible }) })
      if (res.ok) { fetch('/api/admin/annonces').then(r => r.json()).then(setAnnonces); setMsg('✅ Annonce modifiée.'); setShowForm(false) }
    } else {
      const res = await fetch('/api/admin/annonces', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { fetch('/api/admin/annonces').then(r => r.json()).then(setAnnonces); setMsg('✅ Annonce publiée.'); setShowForm(false) }
    }
    setTimeout(() => setMsg(''), 4000)
  }

  const del = async (id: number) => {
    if (!confirm('Supprimer cette annonce ?')) return; setDeleting(id)
    const res = await fetch(`/api/admin/annonces/${id}`, { method: 'DELETE' })
    if (res.ok) setAnnonces(prev => prev.filter(a => a.id !== id))
    setDeleting(null)
  }

  const toggleVisible = async (a: Annonce) => {
    const res = await fetch(`/api/admin/annonces/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...a, visible: !a.visible }) })
    if (res.ok) setAnnonces(prev => prev.map(x => x.id === a.id ? { ...x, visible: !a.visible } : x))
  }

  const prioriteChip: Record<string, string> = { URGENTE: 'chip-error', NORMALE: 'chip-neutral', INFO: 'chip-info' }
  const prioriteLabel: Record<string, string> = { URGENTE: '🔴 Urgent', NORMALE: '📌 Normal', INFO: 'ℹ️ Info' }

  return (
    <div>
      <header className="page-header">
        <h1>📢 Gestion des annonces</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>➕ Nouvelle annonce</button>
      </header>
      <div className="page-body">
        {msg && <div className="alert alert-success">{msg}</div>}

        {showForm && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
            <div className="modal">
              <div className="modal-header">
                <h3>{editA ? '✏️ Modifier' : '➕ Nouvelle'} annonce</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form onSubmit={save}>
                <div className="modal-body">
                  <div className="form-group"><label className="form-label">Priorité</label>
                    <select className="form-select" value={form.priorite} onChange={e => setForm(f => ({...f, priorite: e.target.value}))}>
                      <option value="INFO">ℹ️ Information</option>
                      <option value="NORMALE">📌 Normale</option>
                      <option value="URGENTE">🔴 Urgente</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Titre</label><input className="form-input" value={form.titre} onChange={e => setForm(f => ({...f, titre: e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">Contenu</label><textarea className="form-textarea" value={form.contenu} onChange={e => setForm(f => ({...f, contenu: e.target.value}))} rows={5} required /></div>
                  <div className="form-group">
                    <label className="form-label">Pièce jointe (Optionnelle)</label>
                    {form.documentUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius)' }}>
                        <a href={form.documentUrl} target="_blank" style={{ color: 'var(--color-primary)', textDecoration: 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          📄 {form.documentUrl.split('/').pop()}
                        </a>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(f => ({...f, documentUrl: ''}))}>✕</button>
                      </div>
                    ) : (
                      <Dropzone onUpload={(url) => setForm(f => ({...f, documentUrl: url}))} />
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary">📤 Publier</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {annonces.map(a => (
            <div key={a.id} className="card" style={{ opacity: a.visible ? 1 : 0.6 }}>
              <div style={{ padding: 'var(--space-5) var(--space-6)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>{a.titre}</h3>
                    <span className={`chip ${prioriteChip[a.priorite]}`}>{prioriteLabel[a.priorite]}</span>
                    {!a.visible && <span className="chip chip-neutral">👁️ Masqué</span>}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{a.contenu}</p>
                  {a.documentUrl && (
                    <div style={{ marginTop: 'var(--space-3)' }}>
                      <a href={a.documentUrl} target="_blank" className="btn btn-sm btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        📎 Gérer la pièce jointe
                      </a>
                    </div>
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', marginTop: 'var(--space-3)' }}>
                    {new Date(a.createdAt).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0, flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}>✏️ Modifier</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleVisible(a)}>{a.visible ? '👁️ Masquer' : '👁️ Afficher'}</button>
                  <button className="btn btn-danger btn-sm" disabled={deleting === a.id} onClick={() => del(a.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
