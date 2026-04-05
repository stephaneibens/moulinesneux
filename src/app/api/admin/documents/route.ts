import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const docs = await prisma.document.findMany({ include: { locataire: { select: { nom: true, prenom: true } } } })
  return NextResponse.json(docs)
}

export async function POST(request: Request) {
  const user = await requireAuth('ADMIN')
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const { nom, type, description, url, commun, locataireId } = await request.json()
    const doc = await prisma.document.create({ data: { nom, type, description: description || null, url, commun: !!commun, locataireId: locataireId || null } })
    return NextResponse.json(doc)
  } catch (e: any) {
    console.error("Prisma error in create document:", e);
    return NextResponse.json({ error: e.message || 'Erreur base de données' }, { status: 500 });
  }
}
