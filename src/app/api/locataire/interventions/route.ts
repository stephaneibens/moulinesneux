import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('LOCATAIRE')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const items = prisma.demandeIntervention.findMany({ where: { locataireId: user.id } })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const user = await requireAuth('LOCATAIRE')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { categorie, description, priorite } = await request.json()
  if (!categorie || !description) {
    return NextResponse.json({ error: 'Catégorie et description requises' }, { status: 400 })
  }
  const item = prisma.demandeIntervention.create({
    locataireId: user.id, categorie, description,
    statut: 'SOUMISE', priorite: priorite || 'NORMALE', commentaireAdmin: null,
  })
  return NextResponse.json(item)
}
