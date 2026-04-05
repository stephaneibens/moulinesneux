import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const paiements = prisma.paiement.findMany({ include: { locataire: { select: { nom: true, prenom: true, email: true, appartement: { numero: true } } } } })
  return NextResponse.json(paiements)
}

export async function POST(request: Request) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await request.json()
  const p = prisma.paiement.create({ locataireId: parseInt(body.locataireId), montant: parseFloat(body.montant), type: body.type || 'LOYER', periode: body.periode || null, statut: body.statut || 'EN_ATTENTE', notes: body.notes || null, datePaiement: null, reference: null })
  
  const loc = prisma.user.findUnique({ id: p.locataireId }, { include: { appartement: true } })
  const finalP = { ...p, locataire: { nom: loc?.nom, prenom: loc?.prenom, email: loc?.email, appartement: { numero: loc?.appartement?.numero } } }
  return NextResponse.json(finalP)
}
