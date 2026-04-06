import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('LOCATAIRE')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const items = await prisma.demandeIntervention.findMany({ where: { locataireId: user.id } })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const user = await requireAuth('LOCATAIRE')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { categorie, description, priorite, localisation, photos } = await request.json()
  if (!categorie || !description || !localisation) {
    return NextResponse.json({ error: 'Catégorie, description et localisation requises' }, { status: 400 })
  }
  const item = await prisma.demandeIntervention.create({
    data: {
      locataireId: user.id, categorie, description,
      statut: 'SOUMISE', priorite: priorite || 'NORMALE', commentaireAdmin: null,
      localisation, photos: photos || []
    }
  })
  return NextResponse.json(item)
}
