import { NextResponse } from 'next/server'
import { requireAuth, verifyPassword, hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  const user = await requireAuth('LOCATAIRE')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { prenom, nom, telephone } = await request.json()
  const updated = await prisma.user.update({ where: { id: user.id }, data: { prenom, nom, telephone } })
  return NextResponse.json({ ...updated, passwordHash: undefined })
}

export async function POST(request: Request) {
  const user = await requireAuth('LOCATAIRE')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { oldPassword, newPassword } = await request.json()
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  const valid = await verifyPassword(oldPassword, dbUser.passwordHash)
  if (!valid) return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 })
  const hash = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } })
  return NextResponse.json({ success: true })
}
