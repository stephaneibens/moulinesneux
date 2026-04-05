import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `"Le Moulin d'Esneux" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return { success: false, error }
  }
}

export function emailPaiementConfirme(prenom: string, periode: string, montant: number) {
  return `
    <div style="font-family: 'Work Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f9fb;">
      <div style="background: #002046; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-family: Manrope, sans-serif;">Le Moulin d'Esneux</h1>
      </div>
      <h2 style="color: #002046;">Confirmation de paiement</h2>
      <p>Bonjour ${prenom},</p>
      <p>Votre paiement du loyer pour la période <strong>${periode}</strong> d'un montant de <strong>${montant} €</strong> a bien été enregistré.</p>
      <p>Merci de votre ponctualité.</p>
      <p style="color: #805533;">L'équipe de gestion — Le Moulin d'Esneux</p>
    </div>
  `
}

export function emailNouvelleIntervention(prenom: string, categorie: string, description: string) {
  return `
    <div style="font-family: 'Work Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f9fb;">
      <div style="background: #002046; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-family: Manrope, sans-serif;">Le Moulin d'Esneux</h1>
      </div>
      <h2 style="color: #002046;">Demande d'intervention enregistrée</h2>
      <p>Bonjour ${prenom},</p>
      <p>Votre demande d'intervention a bien été enregistrée :</p>
      <ul>
        <li><strong>Catégorie :</strong> ${categorie}</li>
        <li><strong>Description :</strong> ${description}</li>
      </ul>
      <p>Notre équipe technique vous contactera prochainement.</p>
      <p style="color: #805533;">L'équipe de gestion — Le Moulin d'Esneux</p>
    </div>
  `
}
