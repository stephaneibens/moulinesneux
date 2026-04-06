import { prisma } from './src/lib/prisma'

async function main() {
  console.log("Synchronisation des séquences PostgreSQL...")
  
  // Update sequences for each table
  await prisma.$executeRaw`SELECT setval('"User_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "User"), 1), false);`
  await prisma.$executeRaw`SELECT setval('"Appartement_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "Appartement"), 1), false);`
  await prisma.$executeRaw`SELECT setval('"Paiement_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "Paiement"), 1), false);`
  await prisma.$executeRaw`SELECT setval('"Annonce_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "Annonce"), 1), false);`
  await prisma.$executeRaw`SELECT setval('"DemandeIntervention_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "DemandeIntervention"), 1), false);`
  await prisma.$executeRaw`SELECT setval('"Document_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "Document"), 1), false);`

  console.log("Toutes les séquences ID ont été corrigées avec succès !")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
