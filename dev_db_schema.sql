CREATE TABLE IF NOT EXISTS "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'LOCATAIRE',
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "dateEcheanceBail" DATETIME,
    "garantieLocative" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "appartementId" INTEGER,
    CONSTRAINT "User_appartementId_fkey" FOREIGN KEY ("appartementId") REFERENCES "Appartement" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE IF NOT EXISTS "Appartement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "bloc" TEXT NOT NULL,
    "etage" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "surface" REAL NOT NULL,
    "loyerMensuel" REAL NOT NULL,
    "chargeMensuelle" REAL NOT NULL,
    "description" TEXT,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "Paiement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "montant" REAL NOT NULL,
    "datePaiement" DATETIME,
    "periode" TEXT,
    "type" TEXT NOT NULL DEFAULT 'LOYER',
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "locataireId" INTEGER NOT NULL,
    CONSTRAINT "Paiement_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Annonce" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "priorite" TEXT NOT NULL DEFAULT 'NORMALE',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "documentUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publieParId" INTEGER NOT NULL,
    CONSTRAINT "Annonce_publieParId_fkey" FOREIGN KEY ("publieParId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "DemandeIntervention" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categorie" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'SOUMISE',
    "priorite" TEXT NOT NULL DEFAULT 'NORMALE',
    "commentaireAdmin" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "locataireId" INTEGER,
    CONSTRAINT "DemandeIntervention_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "commun" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locataireId" INTEGER,
    CONSTRAINT "Document_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_appartementId_key" ON "User"("appartementId");
CREATE UNIQUE INDEX "Appartement_numero_key" ON "Appartement"("numero");
