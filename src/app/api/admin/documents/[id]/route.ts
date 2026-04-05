import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth('ADMIN')
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const { id } = await params
    prisma.document.delete({ id: parseInt(id) })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth('ADMIN')
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const { id } = await params
    const body = await request.json()
    const doc = prisma.document.update({ id: parseInt(id) }, body)
    return NextResponse.json(doc)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
