import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const items = await prisma.demandeIntervention.findMany({ include: { locataire: { select: { nom: true, prenom: true, appartement: { select: { numero: true } } } } } })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { categorie, description, priorite, locataireId } = await request.json()
  const val = await prisma.demandeIntervention.create({
    data: {
      locataireId: locataireId ? parseInt(locataireId) : null,
      categorie: categorie || 'AUTRE',
      description,
      priorite: priorite || 'NORMALE',
      statut: 'SOUMISE',
      commentaireAdmin: null
    }
  })
  
  // On doit recharger l'entité pour avoir la relation locataire peuplée s'il y en a un
  let finalVal = val as any
  if (val.locataireId) {
    const loc = await prisma.user.findUnique({ where: { id: val.locataireId }, include: { appartement: true } })
    finalVal = { ...val, locataire: { nom: loc?.nom, prenom: loc?.prenom, appartement: { numero: loc?.appartement?.numero } } }
  } else {
    finalVal = { ...val, locataire: null }
  }
  return NextResponse.json(finalVal)
}
