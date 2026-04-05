import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const updated = await prisma.user.update({ where: { id: parseInt(id) }, data: { nom: body.nom, prenom: body.prenom, telephone: body.telephone, actif: body.actif, appartementId: body.appartementId, dateEcheanceBail: body.dateEcheanceBail || null, garantieLocative: body.garantieLocative ? parseFloat(body.garantieLocative) : null } })
  return NextResponse.json({ ...updated, passwordHash: undefined })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  await prisma.user.update({ where: { id: parseInt(id) }, data: { actif: false } })
  return NextResponse.json({ success: true })
}
