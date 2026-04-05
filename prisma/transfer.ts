import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import Database from "better-sqlite3";

const sqlite = new Database("prisma/dev.db", { readonly: true });

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const pg = new PrismaClient({ adapter });

async function main() {
    console.log("Début du transfert SQLite -> Postgres");

    const appartements = sqlite.prepare("SELECT * FROM Appartement").all() as any[];
    for (const row of appartements) {
        await pg.appartement.create({
            data: {
                id: row.id,
                numero: row.numero,
                bloc: row.bloc,
                etage: row.etage,
                type: row.type,
                surface: row.surface,
                loyerMensuel: row.loyerMensuel,
                chargeMensuelle: row.chargeMensuelle,
                description: row.description,
                disponible: !!row.disponible,
                peb: row.peb,
                ean: row.ean,
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt),
            },
        });
    }
    console.log(`Appartements transférés: ${appartements.length}`);

    const users = sqlite.prepare("SELECT * FROM User").all() as any[];
    for (const row of users) {
        await pg.user.create({
            data: {
                id: row.id,
                email: row.email,
                passwordHash: row.passwordHash,
                role: row.role,
                nom: row.nom,
                prenom: row.prenom,
                telephone: row.telephone,
                actif: !!row.actif,
                dateEcheanceBail: row.dateEcheanceBail ? new Date(row.dateEcheanceBail) : null,
                garantieLocative: row.garantieLocative,
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt),
                appartementId: row.appartementId,
            },
        });
    }
    console.log(`Users transférés: ${users.length}`);

    const paiements = sqlite.prepare("SELECT * FROM Paiement").all() as any[];
    for (const row of paiements) {
        await pg.paiement.create({
            data: {
                id: row.id,
                montant: row.montant,
                datePaiement: row.datePaiement ? new Date(row.datePaiement) : null,
                periode: row.periode,
                type: row.type,
                statut: row.statut,
                reference: row.reference,
                notes: row.notes,
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt),
                locataireId: row.locataireId,
            },
        });
    }
    console.log(`Paiements transférés: ${paiements.length}`);

    const annonces = sqlite.prepare("SELECT * FROM Annonce").all() as any[];
    for (const row of annonces) {
        await pg.annonce.create({
            data: {
                id: row.id,
                titre: row.titre,
                contenu: row.contenu,
                priorite: row.priorite,
                visible: !!row.visible,
                documentUrl: row.documentUrl,
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt),
                publieParId: row.publieParId,
            },
        });
    }
    console.log(`Annonces transférées: ${annonces.length}`);

    const interventions = sqlite.prepare("SELECT * FROM DemandeIntervention").all() as any[];
    for (const row of interventions) {
        await pg.demandeIntervention.create({
            data: {
                id: row.id,
                categorie: row.categorie,
                description: row.description,
                statut: row.statut,
                priorite: row.priorite,
                commentaireAdmin: row.commentaireAdmin,
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt),
                locataireId: row.locataireId,
            },
        });
    }
    console.log(`Interventions transférées: ${interventions.length}`);

    const documents = sqlite.prepare("SELECT * FROM Document").all() as any[];
    const safeTypes = ['BAIL', 'AVIS', 'REGLEMENT', 'FACTURE', 'ETAT_LIEUX_ENTREE', 'ETAT_LIEUX_SORTIE', 'PIECE_IDENTITE', 'DECOMPTE', 'AUTRE'];
    for (const row of documents) {
        await pg.document.create({
            data: {
                id: row.id,
                nom: row.nom,
                type: safeTypes.includes(row.type) ? row.type : 'AUTRE',
                description: row.description,
                url: row.url,
                commun: !!row.commun,
                createdAt: new Date(row.createdAt),
                locataireId: row.locataireId,
            },
        });
    }
    console.log(`Documents transférés: ${documents.length}`);

    console.log("Transfert terminé");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await pg.$disconnect();
        sqlite.close();
    });