import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const apts = prisma.appartement.findMany({
    include: { locataire: { select: { id: true, nom: true, prenom: true, email: true } } },
    orderBy: { numero: 'asc' }
  })
  return NextResponse.json(apts)
}

export async function POST(request: Request) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await request.json()
  const apt = prisma.appartement.create(body)
  return NextResponse.json(apt)
}
