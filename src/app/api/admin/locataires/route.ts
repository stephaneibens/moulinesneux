import { NextResponse } from 'next/server'
import { requireAuth, hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const locataires = await prisma.user.findMany({
    where: { role: 'LOCATAIRE' },
    include: { appartement: true, paiements: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { nom: 'asc' }
  })
  return NextResponse.json(locataires.map(l => ({ ...l, passwordHash: undefined })))
}

export async function POST(request: Request) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await request.json()
  const { email, nom, prenom, telephone, appartementId, password, dateEcheanceBail, garantieLocative, actif } = body
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 })
  const passwordHash = await hashPassword(password || 'Locataire2026!')
  const newUser = await prisma.user.create({ data: { email, nom, prenom, telephone, appartementId: appartementId || null, passwordHash, role: 'LOCATAIRE', dateEcheanceBail: dateEcheanceBail ? new Date(dateEcheanceBail) : null, garantieLocative: garantieLocative ? parseFloat(garantieLocative) : null, actif: actif !== undefined ? actif : true } })
  return NextResponse.json({ ...newUser, passwordHash: undefined })
}
