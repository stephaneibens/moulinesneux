import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const annonces = await prisma.annonce.findMany({
    include: { publiePar: { select: { prenom: true, nom: true } } },
  })

  return NextResponse.json(annonces)
}

export async function POST(request: Request) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { titre, contenu, priorite, documentUrl } = await request.json()

  const a = await prisma.annonce.create({
    data: {
      titre,
      contenu,
      priorite: priorite || 'NORMALE',
      publieParId: user.id,
      documentUrl: documentUrl || null,
    },
  })

  return NextResponse.json(a)
}