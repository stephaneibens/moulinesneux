import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const updated = prisma.annonce.update({ id: parseInt(id) }, { titre: body.titre, contenu: body.contenu, priorite: body.priorite, visible: body.visible, documentUrl: body.documentUrl !== undefined ? body.documentUrl : undefined })
  return NextResponse.json(updated)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  prisma.annonce.delete({ id: parseInt(id) })
  return NextResponse.json({ success: true })
}
