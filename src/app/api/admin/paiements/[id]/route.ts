import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  let datePaiement = body.datePaiement;
  if (datePaiement === undefined) {
    datePaiement = body.statut === 'PAYE' ? new Date().toISOString() : null;
  }
  const updated = await prisma.paiement.update({ where: { id: parseInt(id) }, data: { 
    statut: body.statut, 
    datePaiement, 
    notes: body.notes,
    type: body.type,
    periode: body.periode,
    montant: body.montant !== undefined ? Number(body.montant) : undefined
  }})
  return NextResponse.json(updated)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth('ADMIN')
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const { id } = await params
    
    // Check if bulk delete request or standard
    if (id === 'bulk') {
      const body = await request.json()
      if (body.ids && Array.isArray(body.ids)) {
        await prisma.paiement.deleteMany({ where: { id: { in: body.ids } } })
      }
    } else {
      await prisma.paiement.delete({ where: { id: parseInt(id) } })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
