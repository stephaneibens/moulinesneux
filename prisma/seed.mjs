// seed.mjs — Seeder en JavaScript pur (sans TypeScript)
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const appartements = [
  { numero: '67A',    bloc: '67', etage: 0, type: 'T2', surface: 58,  loyerMensuel: 720,  chargeMensuelle: 120, description: "Bel appartement T2 au rez-de-chaussée, bloc 67." },
  { numero: '67B',    bloc: '67', etage: 1, type: 'T3', surface: 78,  loyerMensuel: 890,  chargeMensuelle: 140, description: "Spacieux T3 au 1er étage, vue sur le jardin." },
  { numero: '67C',    bloc: '67', etage: 2, type: 'T2', surface: 62,  loyerMensuel: 740,  chargeMensuelle: 125, description: "T2 lumineux au 2ème étage." },
  { numero: '69A001', bloc: '69', etage: 0, type: 'T1', surface: 38,  loyerMensuel: 550,  chargeMensuelle: 90,  description: "Studio au rez-de-chaussée, bloc 69A." },
  { numero: '69Abis', bloc: '69', etage: 0, type: 'T2', surface: 55,  loyerMensuel: 700,  chargeMensuelle: 115, description: "T2 au rez-de-chaussée, entrée indépendante." },
  { numero: '69B',    bloc: '69', etage: 1, type: 'T3', surface: 82,  loyerMensuel: 920,  chargeMensuelle: 150, description: "Grand T3 au 1er étage, double exposition." },
  { numero: '69C',    bloc: '69', etage: 2, type: 'T2', surface: 64,  loyerMensuel: 760,  chargeMensuelle: 130, description: "T2 avec balcon au 2ème étage." },
  { numero: '69D1',   bloc: '69', etage: 1, type: 'T2', surface: 60,  loyerMensuel: 730,  chargeMensuelle: 120, description: "T2 résidence D, 1er étage." },
  { numero: '69D2',   bloc: '69', etage: 1, type: 'T2', surface: 61,  loyerMensuel: 735,  chargeMensuelle: 120, description: "T2 résidence D, 1er étage vue arrière." },
  { numero: '69D3',   bloc: '69', etage: 2, type: 'T3', surface: 79,  loyerMensuel: 895,  chargeMensuelle: 145, description: "T3 résidence D, 2ème étage." },
  { numero: '69D4',   bloc: '69', etage: 2, type: 'T2', surface: 58,  loyerMensuel: 720,  chargeMensuelle: 118, description: "T2 résidence D, 2ème étage." },
  { numero: '69D5',   bloc: '69', etage: 3, type: 'T2', surface: 59,  loyerMensuel: 725,  chargeMensuelle: 120, description: "T2 résidence D, 3ème étage." },
  { numero: '69D6',   bloc: '69', etage: 3, type: 'T3', surface: 80,  loyerMensuel: 900,  chargeMensuelle: 148, description: "T3 résidence D, 3ème étage, belle luminosité." },
  { numero: '69D7',   bloc: '69', etage: 4, type: 'T2', surface: 62,  loyerMensuel: 745,  chargeMensuelle: 125, description: "T2 résidence D, 4ème étage avec vue." },
  { numero: '69D8',   bloc: '69', etage: 4, type: 'T3', surface: 85,  loyerMensuel: 950,  chargeMensuelle: 155, description: "Grand T3 résidence D, 4ème étage." },
  { numero: '69D9',   bloc: '69', etage: 5, type: 'T3', surface: 88,  loyerMensuel: 980,  chargeMensuelle: 160, description: "T3 dernier étage résidence D, vue panoramique." },
  { numero: '69E',    bloc: '69', etage: 1, type: 'T4', surface: 105, loyerMensuel: 1200, chargeMensuelle: 180, description: "Grand T4 résidence E, idéal famille." },
]

const locataires = [
  { nom: 'Dupont',    prenom: 'Marie',     email: 'marie.dupont@email.com',      telephone: '0491234567', appartementNum: '67A'    },
  { nom: 'Lambert',  prenom: 'Jean-Marc',  email: 'jm.lambert@email.com',        telephone: '0492345678', appartementNum: '67B'    },
  { nom: 'Marchal',  prenom: 'Sophie',     email: 'sophie.marchal@email.com',    telephone: '0493456789', appartementNum: '67C'    },
  { nom: 'Renard',   prenom: 'Thomas',     email: 'thomas.renard@email.com',     telephone: '0494567890', appartementNum: '69A001' },
  { nom: 'Simon',    prenom: 'Claire',     email: 'claire.simon@email.com',      telephone: '0495678901', appartementNum: '69Abis' },
  { nom: 'Lejeune',  prenom: 'Pierre',     email: 'pierre.lejeune@email.com',    telephone: '0496789012', appartementNum: '69B'    },
  { nom: 'Maes',     prenom: 'Isabelle',   email: 'isabelle.maes@email.com',     telephone: '0497890123', appartementNum: '69C'    },
  { nom: 'Fontaine', prenom: 'Luc',        email: 'luc.fontaine@email.com',      telephone: '0498901234', appartementNum: '69D1'   },
  { nom: 'Gilles',   prenom: 'Anne',       email: 'anne.gilles@email.com',       telephone: '0499012345', appartementNum: '69D2'   },
  { nom: 'Piron',    prenom: 'Michel',     email: 'michel.piron@email.com',      telephone: '0491123456', appartementNum: '69D3'   },
  { nom: 'Collin',   prenom: 'Valérie',   email: 'valerie.collin@email.com',    telephone: '0492234567', appartementNum: '69D4'   },
  { nom: 'Denis',    prenom: 'Francois',  email: 'francois.denis@email.com',    telephone: '0493345678', appartementNum: '69D5'   },
  { nom: 'Bodart',   prenom: 'Nathalie',  email: 'nathalie.bodart@email.com',   telephone: '0494456789', appartementNum: '69D6'   },
  { nom: 'Charlier', prenom: 'David',     email: 'david.charlier@email.com',    telephone: '0495567890', appartementNum: '69D7'   },
  { nom: 'Ernst',    prenom: 'Martine',   email: 'martine.ernst@email.com',     telephone: '0496678901', appartementNum: '69D8'   },
  { nom: 'Pirard',   prenom: 'Alexandre', email: 'alexandre.pirard@email.com',  telephone: '0497789012', appartementNum: '69D9'   },
  { nom: 'Watelet',  prenom: 'Christine', email: 'christine.watelet@email.com', telephone: '0498890123', appartementNum: '69E'    },
]

async function main() {
  console.log('🌱 Démarrage du seeder...')

  const adminHash = await bcrypt.hash('Admin2026!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@moulinesneux.be' },
    update: {},
    create: { email: 'admin@moulinesneux.be', passwordHash: adminHash, role: 'ADMIN', nom: 'Administrateur', prenom: 'Gestionnaire', telephone: '0490000000' },
  })
  console.log('✅ Admin créé:', admin.email)

  for (const apt of appartements) {
    await prisma.appartement.upsert({
      where: { numero: apt.numero },
      update: {},
      create: { ...apt, disponible: false },
    })
  }
  console.log('✅ 17 appartements créés')

  const mdp = await bcrypt.hash('Locataire2026!', 12)
  for (const loc of locataires) {
    const apt = await prisma.appartement.findUnique({ where: { numero: loc.appartementNum } })
    if (!apt) continue
    const user = await prisma.user.upsert({
      where: { email: loc.email },
      update: {},
      create: { email: loc.email, passwordHash: mdp, role: 'LOCATAIRE', nom: loc.nom, prenom: loc.prenom, telephone: loc.telephone, appartementId: apt.id },
    })
    const mois = ['Janvier 2026', 'Fevrier 2026', 'Mars 2026']
    const statuts = ['PAYE', 'PAYE', 'EN_ATTENTE']
    for (let i = 0; i < 3; i++) {
      const ex = await prisma.paiement.findFirst({ where: { locataireId: user.id, periode: mois[i] } })
      if (!ex) {
        await prisma.paiement.create({ data: { locataireId: user.id, montant: apt.loyerMensuel + apt.chargeMensuelle, periode: mois[i], statut: statuts[i], datePaiement: statuts[i] === 'PAYE' ? new Date(2026, i, 5) : null, reference: statuts[i] === 'PAYE' ? `VIRT${user.id}${i}` : null } })
      }
    }
    console.log(`✅ ${loc.prenom} ${loc.nom} (${loc.appartementNum})`)
  }

  if (await prisma.annonce.count() === 0) {
    await prisma.annonce.createMany({ data: [
      { titre: "Bienvenue sur le portail du Moulin d'Esneux", contenu: "Chers résidents, ce portail vous permet de gérer votre bail, suivre vos paiements et soumettre des demandes d'intervention. N'hésitez pas à nous contacter.", priorite: 'INFO', publieParId: admin.id },
      { titre: '🔧 Maintenance ascenseur — Résidence 69D', contenu: "L'ascenseur de la résidence 69D sera en maintenance le mardi 8 avril 2026 de 9h à 17h. Nous nous excusons pour la gêne occasionnée.", priorite: 'URGENTE', publieParId: admin.id },
      { titre: 'Collecte des encombrants — Avril 2026', contenu: 'La collecte des encombrants aura lieu le samedi 19 avril 2026. Merci de déposer vos objets volumineux devant le bâtiment avant 8h00.', priorite: 'NORMALE', publieParId: admin.id },
      { titre: '💧 Contrôle chaudières — Bloc 67', contenu: 'Les techniciens passeront contrôler les chaudières du bloc 67 la semaine du 14 au 18 avril. Vous recevrez un avis de passage individuel.', priorite: 'NORMALE', publieParId: admin.id },
    ]})
    console.log('✅ Annonces créées')
  }

  if (await prisma.document.count() === 0) {
    await prisma.document.createMany({ data: [
      { nom: "Règlement intérieur de l'immeuble", type: 'REGLEMENT', url: '/documents/reglement.pdf', commun: true },
      { nom: 'Guide du tri sélectif', type: 'AVIS', url: '/documents/tri.pdf', commun: true },
      { nom: "Coordonnées d'urgence", type: 'AVIS', url: '/documents/urgences.pdf', commun: true },
    ]})
    console.log('✅ Documents créés')
  }

  const firstLoc = await prisma.user.findFirst({ where: { role: 'LOCATAIRE' } })
  if (firstLoc && await prisma.demandeIntervention.count() === 0) {
    await prisma.demandeIntervention.createMany({ data: [
      { locataireId: firstLoc.id, categorie: 'PLOMBERIE', description: 'Fuite sous le lavabo de la salle de bain.', statut: 'RESOLUE', priorite: 'NORMALE', commentaireAdmin: 'Réparé par le plombier le 10 mars 2026.' },
      { locataireId: firstLoc.id, categorie: 'CHAUFFAGE', description: 'Le radiateur du salon ne chauffe plus correctement.', statut: 'EN_COURS', priorite: 'URGENTE', commentaireAdmin: 'Technicien planifié pour le 5 avril.' },
    ]})
    console.log('✅ Interventions créées')
  }

  console.log('\n🎉 Seeder terminé !')
  console.log('👤 Admin : admin@moulinesneux.be / Admin2026!')
  console.log('👥 Locataires : [email] / Locataire2026!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
