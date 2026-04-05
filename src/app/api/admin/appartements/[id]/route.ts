import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const updated = prisma.appartement.update({ id: parseInt(id) }, { 
    loyerMensuel: body.loyerMensuel, 
    chargeMensuelle: body.chargeMensuelle, 
    description: body.description, 
    disponible: body.disponible,
    type: body.type,
    etage: body.etage !== undefined ? Number(body.etage) : undefined,
    surface: body.surface !== undefined ? Number(body.surface) : undefined,
    peb: body.peb,
    ean: body.ean
  })
  return NextResponse.json(updated)
}
