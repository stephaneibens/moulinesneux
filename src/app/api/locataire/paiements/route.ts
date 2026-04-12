import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('LOCATAIRE')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const paiements = await prisma.paiement.findMany({ 
    where: { locataireId: user.id },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(paiements)
}

export async function POST(request: Request) {
  const user = await requireAuth('LOCATAIRE')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { paiementId } = await request.json()
  const paiement = await prisma.paiement.findFirst({ where: { id: paiementId, locataireId: user.id } })
  if (!paiement) return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
  const updated = await prisma.paiement.update({ where: { id: paiementId }, data: { statut: 'PAYE', datePaiement: new Date().toISOString() } })
  return NextResponse.json(updated)
}
