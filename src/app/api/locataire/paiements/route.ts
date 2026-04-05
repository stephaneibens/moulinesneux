import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('LOCATAIRE')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const paiements = prisma.paiement.findMany({ where: { locataireId: user.id } })
  return NextResponse.json(paiements)
}

export async function POST(request: Request) {
  const user = await requireAuth('LOCATAIRE')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { paiementId } = await request.json()
  const paiements = prisma.paiement.findMany({ where: { locataireId: user.id } })
  const paiement = paiements.find(p => p.id === paiementId)
  if (!paiement) return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
  const updated = prisma.paiement.update({ id: paiementId }, { statut: 'PAYE', datePaiement: new Date().toISOString() })
  return NextResponse.json(updated)
}
