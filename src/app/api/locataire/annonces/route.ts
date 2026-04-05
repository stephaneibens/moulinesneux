import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('LOCATAIRE')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const annonces = prisma.annonce.findMany({
    where: { visible: true },
  }).map(a => ({
    ...a,
    publiePar: prisma.user.findUnique({ id: a.publieParId }) ? { prenom: prisma.user.findUnique({ id: a.publieParId })?.prenom || '', nom: prisma.user.findUnique({ id: a.publieParId })?.nom || '' } : null,
  }))
  return NextResponse.json(annonces)
}
