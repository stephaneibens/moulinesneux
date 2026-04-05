// seed-native.mjs — Seeder utilisant node:sqlite (Node.js v24 natif) + bcryptjs
import { DatabaseSync } from 'node:sqlite'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const bcrypt = require('bcryptjs')

const DB_PATH = path.join(__dirname, 'dev.db')
const db = new DatabaseSync(DB_PATH)

function q(sql, params = []) {
  const stmt = db.prepare(sql)
  return stmt.all(...params)
}
function run(sql, params = []) {
  const stmt = db.prepare(sql)
  return stmt.run(...params)
}
function get(sql, params = []) {
  const stmt = db.prepare(sql)
  return stmt.get(...params)
}

const appartements = [
  { numero: '67A',    bloc: '67', etage: 0, type: 'T2', surface: 58, loyerMensuel: 550, chargeMensuelle: 40, description: "Bail du 01/11/2018 au 31/10/2027. Conditions: Entretien de sa chaudière individuelle et de son jardin privatif.", disponible: 0 },
  { numero: '67B',    bloc: '67', etage: 1, type: 'T3', surface: 78, loyerMensuel: 600, chargeMensuelle: 100, description: "Libre", disponible: 1 },
  { numero: '67C',    bloc: '67', etage: 2, type: 'T2', surface: 62, loyerMensuel: 550, chargeMensuelle: 100, description: "Bail du 01/11/2017 au 31/10/2026. Conditions: Usage de résidence principale ; Interdiction de placer une antenne extérieure sans accord.", disponible: 0 },
  { numero: '69A001', bloc: '69', etage: 0, type: 'T1', surface: 38, loyerMensuel: 500, chargeMensuelle: 65,  description: "Bail du 15/10/2024 au 14/10/2025. Conditions: Interdiction de fumer ; Occupation par 1 personne et 2 petits chats ; Loyer réduit en contrepartie de petits travaux et entretien.", disponible: 0 },
  { numero: '69A002', bloc: '69', etage: 0, type: 'T2', surface: 55, loyerMensuel: 540, chargeMensuelle: 70,  description: "Bail du 07/03/2025 au 06/03/2026. Conditions: Interdiction de fumer ; Occupation par 1 personne et 1 petit chien.", disponible: 0 },
  { numero: '69B',    bloc: '69', etage: 1, type: 'T3', surface: 82, loyerMensuel: 920, chargeMensuelle: 150, description: "Libre", disponible: 1 },
  { numero: '69C',    bloc: '69', etage: 2, type: 'T2', surface: 64, loyerMensuel: 699, chargeMensuelle: 100, description: "Bail du 01/02/2026 au 31/01/2027. Conditions: Interdiction de fumer ; Animaux interdits ; Occupation prévue pour 1 adulte seul.", disponible: 0 },
  { numero: '69D1',   bloc: '69', etage: 1, type: 'T2', surface: 60, loyerMensuel: 810, chargeMensuelle: 100, description: "Bail du 01/08/2025 au 31/07/2026. Conditions: Interdiction de fumer dans les parties fermées ; Animaux non autorisés sans accord préalable ; Occupation prévue pour 1 adulte et 1 enfant.", disponible: 0 },
  { numero: '69D2',   bloc: '69', etage: 1, type: 'T2', surface: 61, loyerMensuel: 730, chargeMensuelle: 90,  description: "Bail du 01/10/2021 au 30/09/2024. Conditions: Interdiction de fumer ; Aucun animal domestique autorisé sans accord.", disponible: 0 },
  { numero: '69D3',   bloc: '69', etage: 2, type: 'T3', surface: 79, loyerMensuel: 599, chargeMensuelle: 80,  description: "Bail du 01/02/2026 au 31/01/2027. Conditions: Interdiction de fumer ; Animaux interdits ; Occupation prévue pour 1 adulte seul.", disponible: 0 },
  { numero: '69D4',   bloc: '69', etage: 2, type: 'T2', surface: 58, loyerMensuel: 595, chargeMensuelle: 65,  description: "Bail du 15/10/2025 au 14/10/2026. Conditions: Interdiction de fumer ; Animaux interdits ; Occupation prévue pour 1 adulte seul.", disponible: 0 },
  { numero: '69D5',   bloc: '69', etage: 3, type: 'T2', surface: 59, loyerMensuel: 725, chargeMensuelle: 120, description: "Libre", disponible: 1 },
  { numero: '69D6',   bloc: '69', etage: 3, type: 'T3', surface: 80, loyerMensuel: 650, chargeMensuelle: 65,  description: "Bail du 10/05/2024 au 09/05/2025. Conditions: Interdiction de fumer ; Aucun animal de compagnie autorisé ; Occupation par une seule personne.", disponible: 0 },
  { numero: '69D7',   bloc: '69', etage: 4, type: 'T2', surface: 62, loyerMensuel: 750, chargeMensuelle: 120, description: "Bail du 01/05/2025 au 30/04/2026. Conditions: Interdiction de fumer ; Aucun animal de compagnie ; Occupation par une seule personne.", disponible: 0 },
  { numero: '69D8',   bloc: '69', etage: 4, type: 'T3', surface: 85, loyerMensuel: 1350, chargeMensuelle: 150, description: "Bail du 15/01/2026 au 14/01/2027. Conditions: Interdiction de fumer ; Aucun animal de compagnie ; Occupation par une personne et trois enfants.", disponible: 0 },
  { numero: '69D9',   bloc: '69', etage: 5, type: 'T3', surface: 88, loyerMensuel: 0, chargeMensuelle: 250, description: "Bail du 01/01/2020 au 31/12/2028. Conditions: Interdiction de fumer ; un animal de compagnie ; Occupation par 2 personnes.", disponible: 0 },
  { numero: '69E',    bloc: '69', etage: 1, type: 'T4', surface: 105, loyerMensuel: 595, chargeMensuelle: 90, description: "Bail du 01/07/2017 au 30/06/2026. Conditions: Usage de résidence principale.", disponible: 0 },
]

const locataires = [
  { nom: 'JACQUEMIN', prenom: 'Francis Harikumar F', email: 'francisjacquemin2@gmail.com', telephone: '352691505658', appartementNum: '67A' },
  { nom: 'BORREMANS', prenom: 'Annabelle', email: 'borremansannabelle11@gmail.com', telephone: '+32 472235597', appartementNum: '67C' },
  { nom: 'ORBAN', prenom: 'Michel Marie J', email: 'orbanmichel1@gmail.com', telephone: '+32 479849792', appartementNum: '69E' },
  { nom: 'TOMBALLE', prenom: 'Nicolas', email: 'tomballe.nico@gmail.com', telephone: '0492/172531', appartementNum: '69A001' },
  { nom: 'ALIÉ', prenom: 'Marine', email: 'marinealie18@hotmail.com', telephone: '0467/196343', appartementNum: '69A002' },
  { nom: 'DELLUTRI', prenom: 'Océane Pamela', email: 'oceanedellutri@gmail.com', telephone: '+32 498 38 05 61', appartementNum: '69C' },
  { nom: 'PIERLET', prenom: 'Gwenn', email: 'gwenpierlet@hotmail.com', telephone: '0498/47.38.24', appartementNum: '69D1' },
  { nom: 'SCHOONBROODT', prenom: 'Jonathan', email: 'jonathanschoonbroodt789@gmail.com', telephone: '04.94.40.13.65', appartementNum: '69D2' },
  { nom: 'DELAHAUT', prenom: 'Mathilde', email: 'delahaut.mathilde@hotmail.com', telephone: '+32470031342', appartementNum: '69D3' },
  { nom: 'SANZ', prenom: 'Laurine', email: 'laurinesanz@icloud.com', telephone: '0470/643677', appartementNum: '69D4' },
  { nom: 'COLIN', prenom: 'Michel', email: 'michelcolin@live.be', telephone: '0498/15.30.44', appartementNum: '69D6' },
  { nom: 'DEMARTEAU', prenom: 'Noah', email: 'noahhh@hotmail.be', telephone: '+32 472805407', appartementNum: '69D7' },
  { nom: 'GELMINI', prenom: 'Christophe', email: 'gelmini.christophe@gmail.com', telephone: '+32 497/849753', appartementNum: '69D8' },
  { nom: 'IBENS', prenom: 'Christophe', email: 'christopheibens5@gmail.com', telephone: '32492851458', appartementNum: '69D9' },
]

async function main() {
  console.log('🌱 Seeder démarré...')
  const now = new Date().toISOString()

  // Admin
  const adminHash = await bcrypt.hash('Admin2026!', 12)
  const existingAdmin = get('SELECT id FROM User WHERE email = ?', ['admin@moulinesneux.be'])
  let adminId
  if (!existingAdmin) {
    run(`INSERT INTO User (email, passwordHash, role, nom, prenom, telephone, actif, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      ['admin@moulinesneux.be', adminHash, 'ADMIN', 'Administrateur', 'Gestionnaire', '0490000000', now, now])
    adminId = get('SELECT id FROM User WHERE email = ?', ['admin@moulinesneux.be']).id
    console.log('✅ Admin créé')
  } else {
    adminId = existingAdmin.id
    console.log('ℹ️ Admin déjà existant')
  }

  // Appartements
  for (const apt of appartements) {
    const ex = get('SELECT id FROM Appartement WHERE numero = ?', [apt.numero])
    if (!ex) {
      run(`INSERT INTO Appartement (numero, bloc, etage, type, surface, loyerMensuel, chargeMensuelle, description, disponible, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [apt.numero, apt.bloc, apt.etage, apt.type, apt.surface, apt.loyerMensuel, apt.chargeMensuelle, apt.description, apt.disponible, now, now])
    }
  }
  console.log('✅ 17 appartements créés')

  // Locataires
  const mdp = await bcrypt.hash('Locataire2026!', 12)
  const mois = ['Janvier 2026', 'Fevrier 2026', 'Mars 2026']
  const statuts = ['PAYE', 'PAYE', 'EN_ATTENTE']

  for (const loc of locataires) {
    const apt = get('SELECT id, loyerMensuel, chargeMensuelle FROM Appartement WHERE numero = ?', [loc.appartementNum])
    if (!apt) continue

    const exUser = get('SELECT id FROM User WHERE email = ?', [loc.email])
    let userId
    if (!exUser) {
      run(`INSERT INTO User (email, passwordHash, role, nom, prenom, telephone, actif, appartementId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [loc.email, mdp, 'LOCATAIRE', loc.nom, loc.prenom, loc.telephone, apt.id, now, now])
      userId = get('SELECT id FROM User WHERE email = ?', [loc.email]).id
    } else {
      userId = exUser.id
    }

    const montant = apt.loyerMensuel + apt.chargeMensuelle
    for (let i = 0; i < 3; i++) {
      const exPay = get('SELECT id FROM Paiement WHERE locataireId = ? AND periode = ?', [userId, mois[i]])
      if (!exPay) {
        const datePayee = statuts[i] === 'PAYE' ? new Date(2026, i, 5).toISOString() : null
        const ref = statuts[i] === 'PAYE' ? `VIRT${userId}0${i}2026` : null
        run(`INSERT INTO Paiement (locataireId, montant, periode, statut, datePaiement, reference, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, montant, mois[i], statuts[i], datePayee, ref, now, now])
      }
    }
    console.log(`✅ ${loc.prenom} ${loc.nom} (${loc.appartementNum})`)
  }

  // Annonces
  const annonceCount = get('SELECT COUNT(*) as c FROM Annonce').c
  if (annonceCount === 0) {
    const annonces = [
      ["Bienvenue sur le portail du Moulin d'Esneux", "Chers résidents, ce portail vous permet de gérer votre bail, suivre vos paiements et soumettre des demandes d'intervention.", 'INFO'],
      ['🔧 Maintenance ascenseur — Résidence 69D', "L'ascenseur de la résidence 69D sera en maintenance le mardi 8 avril de 9h à 17h. Nous nous excusons pour la gêne.", 'URGENTE'],
      ['Collecte des encombrants — Avril 2026', 'La collecte des encombrants aura lieu le samedi 19 avril 2026. Déposez vos objets avant 8h00.', 'NORMALE'],
      ['💧 Contrôle chaudières — Bloc 67', 'Les techniciens passeront contrôler les chaudières du bloc 67 la semaine du 14 au 18 avril.', 'NORMALE'],
    ]
    for (const [titre, contenu, priorite] of annonces) {
      run(`INSERT INTO Annonce (titre, contenu, priorite, visible, publieParId, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, ?, ?)`,
        [titre, contenu, priorite, adminId, now, now])
    }
    console.log('✅ Annonces créées')
  }

  // Documents communs
  const docCount = get('SELECT COUNT(*) as c FROM Document').c
  if (docCount === 0) {
    run(`INSERT INTO Document (nom, type, url, commun, createdAt) VALUES (?, ?, ?, 1, ?)`, ["Règlement intérieur de l'immeuble", 'REGLEMENT', '/documents/reglement.pdf', now])
    run(`INSERT INTO Document (nom, type, url, commun, createdAt) VALUES (?, ?, ?, 1, ?)`, ['Guide du tri sélectif', 'AVIS', '/documents/tri.pdf', now])
    run(`INSERT INTO Document (nom, type, url, commun, createdAt) VALUES (?, ?, ?, 1, ?)`, ["Coordonnées d'urgence", 'AVIS', '/documents/urgences.pdf', now])
    console.log('✅ Documents créés')
  }

  // Interventions fictives
  const intCount = get('SELECT COUNT(*) as c FROM DemandeIntervention').c
  if (intCount === 0) {
    const firstLoc = get('SELECT id FROM User WHERE role = ? LIMIT 1', ['LOCATAIRE'])
    if (firstLoc) {
      run(`INSERT INTO DemandeIntervention (locataireId, categorie, description, statut, priorite, commentaireAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [firstLoc.id, 'PLOMBERIE', 'Fuite sous le lavabo de la salle de bain.', 'RESOLUE', 'NORMALE', 'Réparé par le plombier le 10 mars 2026.', now, now])
      run(`INSERT INTO DemandeIntervention (locataireId, categorie, description, statut, priorite, commentaireAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [firstLoc.id, 'CHAUFFAGE', 'Le radiateur du salon ne chauffe plus correctement.', 'EN_COURS', 'URGENTE', 'Technicien planifié pour le 5 avril.', now, now])
      console.log('✅ Interventions créées')
    }
  }

  console.log('\n🎉 Seeder terminé avec succès !')
  console.log('👤 Admin  : admin@moulinesneux.be / Admin2026!')
  console.log('👥 Locataires : [email] / Locataire2026!')
  db.close()
}

main().catch(e => { console.error(e); process.exit(1) })
