/**
 * Couche d'abstraction base de données
 * Utilise node:sqlite (Node.js v24 natif) comme alternative à Prisma Client
 * car Prisma v7 requiert un adaptateur qui ne peut pas être installé (réseau hors ligne)
 */
import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'

const DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db')

let _db: DatabaseSync | null = null

function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH)
    // Optimisations
    _db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;')
  }
  return _db
}

function q<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
  const db = getDb()
  const stmt = db.prepare(sql)
  return (stmt.all as (...args: unknown[]) => T[])(...params)
}

function get<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined {
  const db = getDb()
  const stmt = db.prepare(sql)
  return (stmt.get as (...args: unknown[]) => T)(...params)
}

function run(sql: string, ...params: unknown[]): { lastInsertRowid: number | bigint; changes: number } {
  const db = getDb()
  const stmt = db.prepare(sql)
  return (stmt.run as (...args: unknown[]) => { lastInsertRowid: number | bigint; changes: number })(...params)
}

// ============================================================
// Types
// ============================================================

export interface User {
  id: number; email: string; nom: string; prenom: string; role: string; telephone: string | null
  passwordHash: string; actif: number | boolean; appartementId: number | null
  dateEcheanceBail: string | null; garantieLocative: number | null
  createdAt: string; updatedAt: string
  appartement?: Appartement | null
  paiements?: Paiement[]
}

export interface Appartement {
  id: number; numero: string; bloc: string; etage: number; type: string; surface: number
  loyerMensuel: number; chargeMensuelle: number; description: string | null; disponible: number | boolean
  peb: string | null; ean: string | null; createdAt: string; updatedAt: string
  locataire?: User | null
}

export interface Paiement {
  id: number; locataireId: number; montant: number; periode: string | null; type: string; statut: string
  datePaiement: string | null; reference: string | null; notes: string | null
  createdAt: string; updatedAt: string
  locataire?: User & { appartement?: Appartement | null } | null
}

export interface Annonce {
  id: number; titre: string; contenu: string; priorite: string; visible: number | boolean
  documentUrl: string | null; publieParId: number; createdAt: string; updatedAt: string
  publiePar?: { prenom: string; nom: string } | null
}

export interface DemandeIntervention {
  id: number; locataireId: number | null; categorie: string; description: string; statut: string
  priorite: string; commentaireAdmin: string | null; createdAt: string; updatedAt: string
  locataire?: User & { appartement?: Appartement | null } | null
}

export interface Document {
  id: number; nom: string; type: string; description: string | null; url: string
  commun: number | boolean; locataireId: number | null; createdAt: string
  locataire?: { nom: string; prenom: string } | null
}

const now = () => new Date().toISOString()

// ============================================================
// User
// ============================================================

const userCols = 'id, email, nom, prenom, role, telephone, passwordHash, actif, dateEcheanceBail, garantieLocative, appartementId, createdAt, updatedAt'

function mapUser(row: Record<string, unknown>): User {
  return row as unknown as User
}

function withAppartement(user: User): User {
  if (!user) return user
  if (user.appartementId) {
    const apt = q<Appartement>('SELECT * FROM Appartement WHERE id = ?', user.appartementId)[0] || null
    return { ...user, appartement: apt }
  }
  return { ...user, appartement: null }
}

export const db = {
  user: {
    findUnique: (where: { id?: number; email?: string }, opts?: { include?: { appartement?: boolean } }): User | null => {
      let row: Record<string, unknown> | undefined
      if (where.id) row = get<Record<string, unknown>>(`SELECT ${userCols} FROM User WHERE id = ?`, where.id)
      else if (where.email) row = get<Record<string, unknown>>(`SELECT ${userCols} FROM User WHERE email = ?`, where.email)
      if (!row) return null
      const user = mapUser(row)
      if (opts?.include?.appartement) return withAppartement(user)
      return user
    },

    findFirst: (where: { role?: string; id?: number }): User | null => {
      let sql = `SELECT ${userCols} FROM User WHERE 1=1`
      const params: unknown[] = []
      if (where.role) { sql += ' AND role = ?'; params.push(where.role) }
      if (where.id) { sql += ' AND id = ?'; params.push(where.id) }
      sql += ' LIMIT 1'
      const row = get<Record<string, unknown>>(sql, ...params)
      return row ? mapUser(row) : null
    },

    findMany: (opts?: {
      where?: { role?: string; actif?: boolean }
      orderBy?: { nom?: string; createdAt?: string }
      include?: { appartement?: boolean; paiements?: { orderBy?: object; take?: number } }
    }): User[] => {
      let sql = `SELECT ${userCols} FROM User WHERE 1=1`
      const params: unknown[] = []
      if (opts?.where?.role) { sql += ' AND role = ?'; params.push(opts.where.role) }
      if (opts?.where?.actif !== undefined) { sql += ' AND actif = ?'; params.push(opts.where.actif ? 1 : 0) }
      if (opts?.orderBy?.nom) sql += ' ORDER BY nom ASC'
      const rows = q<Record<string, unknown>>(sql, ...params)
      return rows.map(row => {
        const user = mapUser(row)
        if (opts?.include?.appartement && user.appartementId) {
          const apt = q<Appartement>('SELECT * FROM Appartement WHERE id = ?', user.appartementId)[0] || null
          ;(user as User & { appartement: Appartement | null }).appartement = apt
        } else if (opts?.include?.appartement) {
          ;(user as User & { appartement: null }).appartement = null
        }
        if (opts?.include?.paiements) {
          let pSql = 'SELECT * FROM Paiement WHERE locataireId = ? ORDER BY createdAt DESC'
          if (opts.include.paiements.take) pSql += ` LIMIT ${opts.include.paiements.take}`
          user.paiements = q<Paiement>(pSql, user.id)
        }
        return user
      })
    },

    count: (where?: { role?: string; actif?: boolean }): number => {
      let sql = 'SELECT COUNT(*) as c FROM User WHERE 1=1'
      const params: unknown[] = []
      if (where?.role) { sql += ' AND role = ?'; params.push(where.role) }
      if (where?.actif !== undefined) { sql += ' AND actif = ?'; params.push(where.actif ? 1 : 0) }
      return (get<{ c: number }>(sql, ...params) || { c: 0 }).c
    },

    create: (data: Partial<User> & { email: string; passwordHash: string; role: string; nom: string; prenom: string }): User => {
      const n = now()
      const res = run(
        'INSERT INTO User (email, passwordHash, role, nom, prenom, telephone, appartementId, actif, dateEcheanceBail, garantieLocative, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)',
        data.email, data.passwordHash, data.role, data.nom, data.prenom,
        data.telephone || null, data.appartementId || null, data.dateEcheanceBail || null, data.garantieLocative || null, n, n
      )
      return db.user.findUnique({ id: Number(res.lastInsertRowid) })!
    },

    update: (where: { id: number }, data: Partial<User>): User => {
      const fields: string[] = []
      const params: unknown[] = []
      if (data.nom !== undefined) { fields.push('nom = ?'); params.push(data.nom) }
      if (data.prenom !== undefined) { fields.push('prenom = ?'); params.push(data.prenom) }
      if (data.telephone !== undefined) { fields.push('telephone = ?'); params.push(data.telephone) }
      if (data.actif !== undefined) { fields.push('actif = ?'); params.push(data.actif ? 1 : 0) }
      if (data.appartementId !== undefined) { fields.push('appartementId = ?'); params.push(data.appartementId) }
      if (data.dateEcheanceBail !== undefined) { fields.push('dateEcheanceBail = ?'); params.push(data.dateEcheanceBail) }
      if (data.garantieLocative !== undefined) { fields.push('garantieLocative = ?'); params.push(data.garantieLocative) }
      if (data.passwordHash !== undefined) { fields.push('passwordHash = ?'); params.push(data.passwordHash) }
      fields.push('updatedAt = ?'); params.push(now()); params.push(where.id)
      run(`UPDATE User SET ${fields.join(', ')} WHERE id = ?`, ...params)
      return db.user.findUnique({ id: where.id }, { include: { appartement: true } })!
    },
    
    upsert(opts: { where: { email: string }; create: Partial<User> & { email: string; passwordHash: string; role: string; nom: string; prenom: string }; update: Partial<User> }): User {
      const existing = db.user.findUnique({ email: opts.where.email })
      if (existing) {
        if (Object.keys(opts.update).length > 0) return db.user.update({ id: existing.id }, opts.update)
        return existing
      }
      return db.user.create(opts.create)
    }
  },

  // ============================================================
  // Appartement
  // ============================================================
  appartement: {
    findUnique: (where: { id?: number; numero?: string }): Appartement | null => {
      let row: Appartement | undefined
      if (where.id) row = get<Appartement>('SELECT * FROM Appartement WHERE id = ?', where.id)
      else if (where.numero) row = get<Appartement>('SELECT * FROM Appartement WHERE numero = ?', where.numero)
      return row || null
    },

    findMany: (opts?: {
      orderBy?: { numero?: string }
      include?: { locataire?: { select?: object } }
    }): (Appartement & { locataire?: User | null })[] => {
      let sql = 'SELECT * FROM Appartement'
      if (opts?.orderBy?.numero) sql += ' ORDER BY numero ASC'
      const rows = q<Appartement>(sql)
      return rows.map(row => {
        if (opts?.include?.locataire) {
          const loc = get<User>(`SELECT id, nom, prenom, email, telephone FROM User WHERE appartementId = ? AND role = 'LOCATAIRE' LIMIT 1`, row.id) || null
          return { ...row, locataire: loc }
        }
        return row
      })
    },

    count: (): number => (get<{ c: number }>('SELECT COUNT(*) as c FROM Appartement') || { c: 0 }).c,

    create: (data: Omit<Appartement, 'id' | 'createdAt' | 'updatedAt'>): Appartement => {
      const n = now()
      const res = run(
        'INSERT INTO Appartement (numero, bloc, etage, type, surface, loyerMensuel, chargeMensuelle, description, disponible, peb, ean, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        data.numero, data.bloc, data.etage, data.type, data.surface, data.loyerMensuel,
        data.chargeMensuelle, data.description || null, data.disponible ? 1 : 0, data.peb || null, data.ean || null, n, n
      )
      return db.appartement.findUnique({ id: Number(res.lastInsertRowid) })!
    },

    update: (where: { id: number }, data: Partial<Appartement>): Appartement => {
      const fields: string[] = []
      const params: unknown[] = []
      if (data.loyerMensuel !== undefined) { fields.push('loyerMensuel = ?'); params.push(data.loyerMensuel) }
      if (data.chargeMensuelle !== undefined) { fields.push('chargeMensuelle = ?'); params.push(data.chargeMensuelle) }
      if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description) }
      if (data.disponible !== undefined) { fields.push('disponible = ?'); params.push(data.disponible ? 1 : 0) }
      if (data.type !== undefined) { fields.push('type = ?'); params.push(data.type) }
      if (data.etage !== undefined) { fields.push('etage = ?'); params.push(data.etage) }
      if (data.surface !== undefined) { fields.push('surface = ?'); params.push(data.surface) }
      if (data.peb !== undefined) { fields.push('peb = ?'); params.push(data.peb) }
      if (data.ean !== undefined) { fields.push('ean = ?'); params.push(data.ean) }
      fields.push('updatedAt = ?'); params.push(now()); params.push(where.id)
      run(`UPDATE Appartement SET ${fields.join(', ')} WHERE id = ?`, ...params)
      return db.appartement.findUnique({ id: where.id })!
    },

    upsert(opts: { where: { numero: string }; create: Omit<Appartement, 'id' | 'createdAt' | 'updatedAt'>; update: Partial<Appartement> }): Appartement {
      const existing = db.appartement.findUnique({ numero: opts.where.numero })
      if (existing) return existing
      return db.appartement.create(opts.create)
    }
  },

  // ============================================================
  // Paiement
  // ============================================================
  paiement: {
    findMany: (opts?: {
      where?: { locataireId?: number; statut?: string; statut_in?: string[]; periode?: string }
      orderBy?: { createdAt?: string }
      include?: { locataire?: { select?: object } }
    }): Paiement[] => {
      let sql = 'SELECT * FROM Paiement WHERE 1=1'
      const params: unknown[] = []
      if (opts?.where?.locataireId) { sql += ' AND locataireId = ?'; params.push(opts.where.locataireId) }
      if (opts?.where?.statut) { sql += ' AND statut = ?'; params.push(opts.where.statut) }
      if (opts?.where?.statut_in) { sql += ` AND statut IN (${opts.where.statut_in.map(() => '?').join(',')})`; params.push(...opts.where.statut_in) }
      if (opts?.where?.periode) { sql += ' AND periode = ?'; params.push(opts.where.periode) }
      sql += ' ORDER BY createdAt DESC'
      const rows = q<Paiement>(sql, ...params)
      if (!opts?.include?.locataire) return rows
      return rows.map(row => {
        const loc = db.user.findUnique({ id: row.locataireId }, { include: { appartement: true } })
        return { ...row, locataire: loc }
      })
    },

    findUnique: (where: { id: number }): Paiement | null => {
      const row = get<Paiement>('SELECT * FROM Paiement WHERE id = ?', where.id)
      return row || null
    },

    findFirst: (where: { locataireId: number; periode: string }): Paiement | null => {
      const row = get<Paiement>('SELECT * FROM Paiement WHERE locataireId = ? AND periode = ? LIMIT 1', where.locataireId, where.periode)
      return row || null
    },

    count: (where?: { statut_in?: string[] }): number => {
      let sql = 'SELECT COUNT(*) as c FROM Paiement WHERE 1=1'
      const params: unknown[] = []
      if (where?.statut_in) { sql += ` AND statut IN (${where.statut_in.map(() => '?').join(',')})`; params.push(...where.statut_in) }
      return (get<{ c: number }>(sql, ...params) || { c: 0 }).c
    },

    create: (data: Omit<Paiement, 'id' | 'createdAt' | 'updatedAt'>): Paiement => {
      const n = now()
      const res = run(
        'INSERT INTO Paiement (locataireId, montant, periode, type, statut, datePaiement, reference, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        data.locataireId, data.montant, data.periode || null, data.type || 'LOYER', data.statut || 'EN_ATTENTE',
        data.datePaiement || null, data.reference || null, data.notes || null, n, n
      )
      return q<Paiement>('SELECT * FROM Paiement WHERE id = ?', Number(res.lastInsertRowid))[0]
    },

    update: (where: { id: number }, data: Partial<Paiement>): Paiement => {
      const fields: string[] = []
      const params: unknown[] = []
      if (data.statut !== undefined) { fields.push('statut = ?'); params.push(data.statut) }
      if (data.datePaiement !== undefined) { fields.push('datePaiement = ?'); params.push(data.datePaiement) }
      if (data.notes !== undefined) { fields.push('notes = ?'); params.push(data.notes) }
      if (data.type !== undefined) { fields.push('type = ?'); params.push(data.type) }
      if (data.periode !== undefined) { fields.push('periode = ?'); params.push(data.periode) }
      if (data.montant !== undefined) { fields.push('montant = ?'); params.push(data.montant) }
      fields.push('updatedAt = ?'); params.push(now()); params.push(where.id)
      run(`UPDATE Paiement SET ${fields.join(', ')} WHERE id = ?`, ...params)
      return db.paiement.findUnique({ id: where.id })!
    },

    delete: (where: { id: number }): void => {
      run('DELETE FROM Paiement WHERE id = ?', where.id)
    },

    deleteMany: (where: { id_in: number[] }): void => {
      if (!where.id_in || where.id_in.length === 0) return
      run(`DELETE FROM Paiement WHERE id IN (${where.id_in.map(() => '?').join(',')})`, ...where.id_in)
    }
  },

  // ============================================================
  // Annonce
  // ============================================================
  annonce: {
    findMany: (opts?: {
      where?: { visible?: boolean }
      orderBy?: object[]
      include?: { publiePar?: { select?: object } }
    }): Annonce[] => {
      let sql = 'SELECT * FROM Annonce WHERE 1=1'
      const params: unknown[] = []
      if (opts?.where?.visible !== undefined) { sql += ' AND visible = ?'; params.push(opts.where.visible ? 1 : 0) }
      sql += ' ORDER BY createdAt DESC'
      const rows = q<Annonce>(sql, ...params)
      if (!opts?.include?.publiePar) return rows
      return rows.map(row => {
        const admin = get<{ prenom: string; nom: string }>('SELECT prenom, nom FROM User WHERE id = ?', row.publieParId) || null
        return { ...row, publiePar: admin }
      })
    },

    count: (): number => (get<{ c: number }>('SELECT COUNT(*) as c FROM Annonce') || { c: 0 }).c,

    create: (data: { titre: string; contenu: string; priorite: string; publieParId: number; documentUrl?: string | null }): Annonce => {
      const n = now()
      const res = run(
        'INSERT INTO Annonce (titre, contenu, priorite, visible, documentUrl, publieParId, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, ?, ?, ?)',
        data.titre, data.contenu, data.priorite, data.documentUrl || null, data.publieParId, n, n
      )
      return q<Annonce>('SELECT * FROM Annonce WHERE id = ?', Number(res.lastInsertRowid))[0]
    },

    update: (where: { id: number }, data: Partial<Annonce>): Annonce => {
      const fields: string[] = []
      const params: unknown[] = []
      if (data.titre !== undefined) { fields.push('titre = ?'); params.push(data.titre) }
      if (data.contenu !== undefined) { fields.push('contenu = ?'); params.push(data.contenu) }
      if (data.priorite !== undefined) { fields.push('priorite = ?'); params.push(data.priorite) }
      if (data.visible !== undefined) { fields.push('visible = ?'); params.push(data.visible ? 1 : 0) }
      if (data.documentUrl !== undefined) { fields.push('documentUrl = ?'); params.push(data.documentUrl) }
      fields.push('updatedAt = ?'); params.push(now()); params.push(where.id)
      run(`UPDATE Annonce SET ${fields.join(', ')} WHERE id = ?`, ...params)
      return q<Annonce>('SELECT * FROM Annonce WHERE id = ?', where.id)[0]
    },

    delete: (where: { id: number }): void => {
      run('DELETE FROM Annonce WHERE id = ?', where.id)
    },

    createMany: (data: { data: Array<{ titre: string; contenu: string; priorite: string; publieParId: number; visible?: boolean }> }): void => {
      for (const item of data.data) {
        db.annonce.create({ ...item, priorite: item.priorite, publieParId: item.publieParId })
      }
    }
  },

  // ============================================================
  // DemandeIntervention
  // ============================================================
  demandeIntervention: {
    findMany: (opts?: {
      where?: { locataireId?: number; statut_in?: string[] }
      orderBy?: object[]
      include?: { locataire?: { select?: object } }
    }): DemandeIntervention[] => {
      let sql = 'SELECT * FROM DemandeIntervention WHERE 1=1'
      const params: unknown[] = []
      if (opts?.where?.locataireId) { sql += ' AND locataireId = ?'; params.push(opts.where.locataireId) }
      sql += ' ORDER BY createdAt DESC'
      const rows = q<DemandeIntervention>(sql, ...params)
      if (!opts?.include?.locataire) return rows
      return rows.map(row => {
        const loc = row.locataireId ? db.user.findUnique({ id: row.locataireId }, { include: { appartement: true } }) : null
        return { ...row, locataire: loc }
      })
    },

    count: (where?: { statut_in?: string[] }): number => {
      let sql = 'SELECT COUNT(*) as c FROM DemandeIntervention WHERE 1=1'
      const params: unknown[] = []
      if (where?.statut_in) { sql += ` AND statut IN (${where.statut_in.map(() => '?').join(',')})`; params.push(...where.statut_in) }
      return (get<{ c: number }>(sql, ...params) || { c: 0 }).c
    },

    create: (data: Omit<DemandeIntervention, 'id' | 'createdAt' | 'updatedAt'>): DemandeIntervention => {
      const n = now()
      const res = run(
        'INSERT INTO DemandeIntervention (locataireId, categorie, description, statut, priorite, commentaireAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        data.locataireId || null, data.categorie, data.description, data.statut || 'SOUMISE',
        data.priorite || 'NORMALE', data.commentaireAdmin || null, n, n
      )
      return q<DemandeIntervention>('SELECT * FROM DemandeIntervention WHERE id = ?', Number(res.lastInsertRowid))[0]
    },

    update: (where: { id: number }, data: Partial<DemandeIntervention>): DemandeIntervention => {
      const fields: string[] = []
      const params: unknown[] = []
      if (data.statut !== undefined) { fields.push('statut = ?'); params.push(data.statut) }
      if (data.commentaireAdmin !== undefined) { fields.push('commentaireAdmin = ?'); params.push(data.commentaireAdmin) }
      if (data.priorite !== undefined) { fields.push('priorite = ?'); params.push(data.priorite) }
      if (data.categorie !== undefined) { fields.push('categorie = ?'); params.push(data.categorie) }
      if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description) }
      fields.push('updatedAt = ?'); params.push(now()); params.push(where.id)
      run(`UPDATE DemandeIntervention SET ${fields.join(', ')} WHERE id = ?`, ...params)
      return q<DemandeIntervention>('SELECT * FROM DemandeIntervention WHERE id = ?', where.id)[0]
    },

    createMany: (data: { data: Array<Omit<DemandeIntervention, 'id' | 'createdAt' | 'updatedAt'>> }): void => {
      for (const item of data.data) db.demandeIntervention.create(item)
    },

    delete: (where: { id: number }): void => {
      run('DELETE FROM DemandeIntervention WHERE id = ?', where.id)
    }
  },

  // ============================================================
  // Document
  // ============================================================
  document: {
    findMany: (opts?: {
      where?: { OR?: Array<{ commun?: boolean; locataireId?: number }> }
      orderBy?: { createdAt?: string }
      include?: { locataire?: { select?: object } }
    }): Document[] => {
      const rows = q<Document>('SELECT * FROM Document ORDER BY createdAt DESC')
      if (!opts?.where) {
        if (opts?.include?.locataire) {
          return rows.map(row => {
            const loc = row.locataireId ? get<{ nom: string; prenom: string }>('SELECT nom, prenom FROM User WHERE id = ?', row.locataireId) || null : null
            return { ...row, locataire: loc }
          })
        }
        return rows
      }
      if (opts?.where?.OR) {
        const orConditions = opts.where.OR
        return rows.filter(row => orConditions.some(cond => {
          if (cond.commun !== undefined && (row.commun === 1 || row.commun === true)) return true
          if (cond.locataireId !== undefined && row.locataireId === cond.locataireId) return true
          return false
        }))
      }
      return rows
    },

    count: (): number => (get<{ c: number }>('SELECT COUNT(*) as c FROM Document') || { c: 0 }).c,

    create: (data: Omit<Document, 'id' | 'createdAt'> & { createdAt?: string }): Document => {
      const n = now()
      const res = run(
        'INSERT INTO Document (nom, type, description, url, commun, locataireId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        data.nom, data.type, data.description || null, data.url, data.commun ? 1 : 0, data.locataireId || null, n
      )
      return q<Document>('SELECT * FROM Document WHERE id = ?', Number(res.lastInsertRowid))[0]
    },

    createMany: (data: { data: Array<Omit<Document, 'id' | 'locataireId' | 'createdAt'> & { locataireId?: number | null }> }): void => {
      for (const item of data.data) db.document.create({ ...item, locataireId: item.locataireId || null })
    },

    delete: (where: { id: number }): void => {
      run('DELETE FROM Document WHERE id = ?', where.id)
    },

    update: (where: { id: number }, data: Partial<Document>): Document => {
      const fields: string[] = []
      const params: unknown[] = []
      if (data.nom !== undefined) { fields.push('nom = ?'); params.push(data.nom) }
      if (data.type !== undefined) { fields.push('type = ?'); params.push(data.type) }
      if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description) }
      if (data.url !== undefined) { fields.push('url = ?'); params.push(data.url) }
      if (data.commun !== undefined) { fields.push('commun = ?'); params.push(data.commun ? 1 : 0) }
      if (data.locataireId !== undefined) { fields.push('locataireId = ?'); params.push(data.locataireId) }
      params.push(where.id)
      run(`UPDATE Document SET ${fields.join(', ')} WHERE id = ?`, ...params)
      return q<Document>('SELECT * FROM Document WHERE id = ?', where.id)[0]
    }
  }
}

// Alias pour compatibilité avec l'ancien code Prisma
export const prisma = db
