import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const [totalLocataires, paiementsEnAttente, interventionsEnCours, totalAppartements] = [
    prisma.user.count({ role: 'LOCATAIRE', actif: true }),
    prisma.paiement.count({ statut_in: ['EN_ATTENTE', 'RETARD'] }),
    prisma.demandeIntervention.count({ statut_in: ['SOUMISE', 'EN_COURS'] }),
    prisma.appartement.count(),
  ]
  const paiementsMois = prisma.paiement.findMany({ where: { periode: 'Mars 2026' } })
  const totalLoyers = paiementsMois.filter(p => p.statut === 'PAYE').reduce((s, p) => s + p.montant, 0)
  return NextResponse.json({ totalLocataires, paiementsEnAttente, interventionsEnCours, totalAppartements, totalLoyers })
}
