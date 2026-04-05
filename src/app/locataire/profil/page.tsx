'use client'
import { useEffect, useState } from 'react'

interface User { id: number; prenom: string; nom: string; email: string; telephone: string | null; appartement: { numero: string; type: string; surface: number } | null }

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null)
  const [prenom, setPrenom] = useState(''); const [nom, setNom] = useState(''); const [telephone, setTelephone] = useState('')
  const [oldPwd, setOldPwd] = useState(''); const [newPwd, setNewPwd] = useState(''); const [confirmPwd, setConfirmPwd] = useState('')
  const [msg, setMsg] = useState(''); const [msgType, setMsgType] = useState<'success'|'error'>('success')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setUser(d.user); setPrenom(d.user.prenom); setNom(d.user.nom); setTelephone(d.user.telephone || '')
    })
  }, [])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const res = await fetch('/api/locataire/profil', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prenom, nom, telephone }) })
    if (res.ok) { setMsg('✅ Profil mis à jour.'); setMsgType('success') } else { setMsg('❌ Erreur lors de la mise à jour.'); setMsgType('error') }
    setSaving(false); setTimeout(() => setMsg(''), 4000)
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPwd !== confirmPwd) { setMsg('❌ Les mots de passe ne correspondent pas.'); setMsgType('error'); return }
    if (newPwd.length < 8) { setMsg('❌ Le mot de passe doit contenir au moins 8 caractères.'); setMsgType('error'); return }
    setSaving(true)
    const res = await fetch('/api/locataire/profil', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }) })
    if (res.ok) { setMsg('✅ Mot de passe modifié.'); setMsgType('success'); setOldPwd(''); setNewPwd(''); setConfirmPwd('') }
    else { const d = await res.json(); setMsg(`❌ ${d.error}`); setMsgType('error') }
    setSaving(false); setTimeout(() => setMsg(''), 5000)
  }

  return (
    <div>
      <header className="page-header"><h1>👤 Mon profil</h1></header>
      <div className="page-body">
        {msg && <div className={`alert alert-${msgType === 'success' ? 'success' : 'error'}`}>{msg}</div>}
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>📋 Informations personnelles</h3></div>
            <form onSubmit={saveProfile}>
              <div className="card-body">
                <div className="form-group"><label className="form-label">Prénom</label><input className="form-input" value={prenom} onChange={e => setPrenom(e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Nom</label><input className="form-input" value={nom} onChange={e => setNom(e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Téléphone</label><input className="form-input" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+32 4XX XX XX XX" /></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} /></div>
              </div>
              <div className="card-footer" style={{ textAlign: 'right' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳...' : '💾 Enregistrer'}</button>
              </div>
            </form>
          </div>
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>🔐 Changer le mot de passe</h3></div>
            <form onSubmit={changePassword}>
              <div className="card-body">
                <div className="form-group"><label className="form-label">Mot de passe actuel</label><input type="password" className="form-input" value={oldPwd} onChange={e => setOldPwd(e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Nouveau mot de passe</label><input type="password" className="form-input" value={newPwd} onChange={e => setNewPwd(e.target.value)} minLength={8} required /></div>
                <div className="form-group"><label className="form-label">Confirmer le nouveau mot de passe</label><input type="password" className="form-input" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required /></div>
              </div>
              <div className="card-footer" style={{ textAlign: 'right' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳...' : '🔐 Modifier'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
