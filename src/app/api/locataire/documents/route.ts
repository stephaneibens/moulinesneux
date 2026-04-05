import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('LOCATAIRE')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const docs = await prisma.document.findMany({
    where: { OR: [{ commun: true }, { locataireId: user.id }] },
  })
  return NextResponse.json(docs)
}
