import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('LOCATAIRE')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const annoncesDb = await prisma.annonce.findMany({
    where: { visible: true },
  })
  
  const annonces = await Promise.all(annoncesDb.map(async (a) => {
    const publieParUser = await prisma.user.findUnique({ where: { id: a.publieParId } })
    return {
      ...a,
      publiePar: publieParUser ? { prenom: publieParUser.prenom || '', nom: publieParUser.nom || '' } : null,
    }
  }))
  return NextResponse.json(annonces)
}
