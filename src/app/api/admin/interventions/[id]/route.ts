import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const updated = prisma.demandeIntervention.update({ id: parseInt(id) }, body)
  return NextResponse.json(updated)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  prisma.demandeIntervention.delete({ id: parseInt(id) })
  return NextResponse.json({ success: true })
}
