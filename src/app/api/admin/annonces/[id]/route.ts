import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const body = await request.json()

  const updated = await prisma.annonce.update({
    where: { id: parseInt(id) },
    data: {
      titre: body.titre,
      contenu: body.contenu,
      priorite: body.priorite,
      visible: body.visible,
      documentUrl: body.documentUrl ?? null,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params

  await prisma.annonce.delete({
    where: { id: parseInt(id) },
  })

  return NextResponse.json({ success: true })
}
