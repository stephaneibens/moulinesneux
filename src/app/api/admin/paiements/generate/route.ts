import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const admin = await requireAuth('ADMIN')
    if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Find all locataires that have an appartement
    const locataires = await prisma.user.findMany({ where: { role: 'LOCATAIRE', actif: true }, include: { appartement: true } })
    const activeLocataires = locataires.filter(l => l.appartementId && l.appartement)

    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const year = nextMonth.getFullYear()
    const month = nextMonth.toLocaleString('fr-FR', { month: 'long' })
    const periode = `${month} ${year}`

    let createdCount = 0

    for (const l of activeLocataires) {
      if (!l.appartement) continue
      
      const loyer = l.appartement.loyerMensuel || 0
      const charges = l.appartement.chargeMensuelle || 0
      const total = loyer + charges

      // Prevent duplicate generation for same month
      const existing = await prisma.paiement.findFirst({ where: { locataireId: l.id, periode: periode } })
      if (!existing && total > 0) {
        await prisma.paiement.create({
          data: {
            locataireId: l.id,
            montant: total,
            periode: periode,
            type: 'LOYER',
            statut: 'EN_ATTENTE',
            notes: '',
            datePaiement: null,
            reference: null
          }
        })
        createdCount++
      }
    }

    return NextResponse.json({ success: true, count: createdCount, periode })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
