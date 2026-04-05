import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Vidage de la base Postgres...");

    await prisma.paiement.deleteMany();
    await prisma.demandeIntervention.deleteMany();
    await prisma.document.deleteMany();
    await prisma.annonce.deleteMany();
    await prisma.user.deleteMany();
    await prisma.appartement.deleteMany();

    console.log("Base Postgres vidée.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });