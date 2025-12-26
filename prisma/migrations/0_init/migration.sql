-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `dateNaissance` DATETIME(3) NULL,
    `genre` VARCHAR(191) NULL,
    `telephone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `adresseId` VARCHAR(191) NULL,
    `dateOuverture` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateCloture` DATETIME(3) NULL,
    `etat` VARCHAR(191) NOT NULL DEFAULT 'Actif',
    `antenne` VARCHAR(191) NULL,
    `statutSejour` VARCHAR(191) NULL,
    `nationalite` VARCHAR(191) NULL,
    `trancheAge` VARCHAR(191) NULL,
    `remarques` TEXT NULL,
    `hasPrevExp` BOOLEAN NULL,
    `langue` VARCHAR(191) NULL,
    `premierContact` VARCHAR(191) NULL,
    `prevExpCommentaire` TEXT NULL,
    `prevExpDateReception` DATETIME(3) NULL,
    `prevExpDateRequete` DATETIME(3) NULL,
    `prevExpDateVad` DATETIME(3) NULL,
    `prevExpDecision` VARCHAR(191) NULL,
    `secteur` VARCHAR(191) NULL,
    `logementDetails` TEXT NULL,
    `notesGenerales` TEXT NULL,
    `rgpdAttestationGeneratedAt` DATETIME(3) NULL,
    `gestionnaireId` VARCHAR(191) NULL,
    `geographicalSectorId` INTEGER NULL,
    `streetId` INTEGER NULL,
    `problematiquesDetails` TEXT NULL,
    `informationImportante` TEXT NULL,
    `partenaire` VARCHAR(191) NULL,
    `afficherDonneesConfidentielles` BOOLEAN NULL DEFAULT false,
    `donneesConfidentielles` TEXT NULL,
    `annee` INTEGER NOT NULL,
    `dossierPrecedentId` VARCHAR(191) NULL,
    `prevExpAideJuridique` VARCHAR(191) NULL,
    `prevExpDateAudience` DATETIME(3) NULL,
    `serviceId` VARCHAR(191) NOT NULL DEFAULT 'default',
    `prevExpDateExpulsion` DATETIME(3) NULL,
    `prevExpDateJugement` DATETIME(3) NULL,
    `prevExpDateSignification` DATETIME(3) NULL,
    `prevExpDemandeCpas` VARCHAR(191) NULL,
    `prevExpEtatLogement` VARCHAR(191) NULL,
    `prevExpMaintienLogement` VARCHAR(191) NULL,
    `prevExpMotifRequete` VARCHAR(191) NULL,
    `prevExpNegociationProprio` VARCHAR(191) NULL,
    `prevExpNombreChambre` VARCHAR(191) NULL,
    `prevExpSolutionRelogement` VARCHAR(191) NULL,
    `prevExpTypeFamille` VARCHAR(191) NULL,
    `prevExpTypeRevenu` VARCHAR(191) NULL,
    `revenus` VARCHAR(191) NULL,
    `situationProfessionnelle` VARCHAR(191) NULL,
    `prevExpDossierOuvert` VARCHAR(191) NULL,
    `mediationType` VARCHAR(191) NULL,
    `mediationDemandeur` VARCHAR(191) NULL,
    `mediationPartieAdverse` VARCHAR(191) NULL,
    `mediationStatut` VARCHAR(191) NULL,
    `mediationDescription` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedBy` VARCHAR(191) NULL,

    INDEX `User_serviceId_idx`(`serviceId`),
    INDEX `User_nom_prenom_idx`(`nom`, `prenom`),
    INDEX `User_gestionnaireId_fkey`(`gestionnaireId`),
    INDEX `User_adresseId_fkey`(`adresseId`),
    INDEX `User_geographicalSectorId_fkey`(`geographicalSectorId`),
    INDEX `User_streetId_fkey`(`streetId`),
    INDEX `User_annee_idx`(`annee`),
    INDEX `User_dossierPrecedentId_idx`(`dossierPrecedentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `adresses` (
    `id` VARCHAR(191) NOT NULL,
    `rue` VARCHAR(191) NULL,
    `codePostal` VARCHAR(191) NULL,
    `ville` VARCHAR(191) NULL,
    `pays` VARCHAR(191) NULL DEFAULT 'Belgique',
    `boite` VARCHAR(191) NULL,
    `numero` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `contenu` TEXT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Document_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `problematiques` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `detail` TEXT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `dateSignalement` DATETIME(3) NULL,

    INDEX `problematiques_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actions_suivi` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` VARCHAR(191) NOT NULL,
    `partenaire` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `actions_suivi_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gestionnaires` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `serviceId` VARCHAR(191) NOT NULL DEFAULT 'default',
    `couleurMedaillon` LONGTEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastActiveServiceId` VARCHAR(191) NULL,
    `horaireHabituel` JSON NULL,
    `isGestionnaireDossier` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `gestionnaires_email_key`(`email`),
    INDEX `gestionnaires_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dropdown_options` (
    `id` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'unknown',
    `serviceId` VARCHAR(191) NOT NULL DEFAULT 'default',

    INDEX `dropdown_options_serviceId_idx`(`serviceId`),
    UNIQUE INDEX `dropdown_options_type_value_serviceId_key`(`type`, `value`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `secteurs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rues` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `geographicalSectorId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Street_geographicalSectorId_fkey`(`geographicalSectorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NULL,
    `serviceName` VARCHAR(191) NOT NULL DEFAULT 'LE PÔLE ACCUEIL SOCIAL DES QUARTIERS',
    `logoUrl` VARCHAR(191) NULL,
    `primaryColor` VARCHAR(191) NOT NULL DEFAULT '#1e3a8a',
    `headerSubtitle` VARCHAR(191) NOT NULL DEFAULT 'PORTAIL DE GESTION',
    `showCommunalLogo` BOOLEAN NOT NULL DEFAULT true,
    `requiredFields` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `colleagueBirthdays` LONGTEXT NOT NULL,
    `enableBirthdays` BOOLEAN NOT NULL DEFAULT false,
    `activeHolidayTheme` VARCHAR(191) NOT NULL DEFAULT 'NONE',
    `availableYears` LONGTEXT NOT NULL,
    `aiEnabled` BOOLEAN NOT NULL DEFAULT true,
    `aiProvider` VARCHAR(191) NOT NULL DEFAULT 'ollama',
    `aiEndpoint` VARCHAR(191) NOT NULL DEFAULT 'http://192.168.2.147:11434',
    `aiModel` VARCHAR(191) NOT NULL DEFAULT 'qwen2.5:3b',
    `aiTemperature` DOUBLE NOT NULL DEFAULT 0.7,
    `aiGroqApiKey` VARCHAR(255) NULL,
    `aiGroqModel` VARCHAR(191) NOT NULL DEFAULT 'llama-3.1-8b-instant',
    `aiUseKeyPool` BOOLEAN NOT NULL DEFAULT false,
    `aiEnableAnalysis` BOOLEAN NOT NULL DEFAULT true,
    `aiAnalysisTemperature` DOUBLE NOT NULL DEFAULT 0,
    `aiCustomAnalysisPrompt` TEXT NULL,
    `enabledModules` JSON NULL,
    `visibleColumns` JSON NULL,
    `visibleFormSections` JSON NULL,
    `docRetentionPeriod` VARCHAR(191) NULL DEFAULT '3 ans',
    `docServiceAddress` VARCHAR(191) NULL,
    `docServiceCity` VARCHAR(191) NULL,
    `docServicePhone` VARCHAR(191) NULL,
    `docFooterText` VARCHAR(191) NULL,
    `docRgpdTitle` TEXT NULL,
    `docRgpdSections` LONGTEXT NULL,
    `docUserProfileSections` LONGTEXT NULL,
    `docAntenneAddresses` LONGTEXT NULL,
    `absenceNotificationEmail` VARCHAR(191) NULL,
    `sharepointUrl` TEXT NULL,
    `sharepointUrlAdmin` TEXT NULL,

    INDEX `settings_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_keys` (
    `id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'groq',
    `key` VARCHAR(255) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastUsedAt` DATETIME(3) NULL,
    `requestsToday` INTEGER NOT NULL DEFAULT 0,
    `isRateLimited` BOOLEAN NOT NULL DEFAULT false,
    `rateLimitedUntil` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `cluster` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Service_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prestations` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `heureDebut` VARCHAR(191) NOT NULL,
    `heureFin` VARCHAR(191) NOT NULL,
    `pause` INTEGER NOT NULL DEFAULT 0,
    `dureeNet` INTEGER NOT NULL DEFAULT 0,
    `isOvertime` BOOLEAN NOT NULL DEFAULT false,
    `bonis` INTEGER NOT NULL DEFAULT 0,
    `motif` VARCHAR(191) NOT NULL,
    `commentaire` TEXT NULL,
    `gestionnaireId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL DEFAULT 'default',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `prestations_gestionnaireId_idx`(`gestionnaireId`),
    INDEX `prestations_serviceId_idx`(`serviceId`),
    INDEX `prestations_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `holidays` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL DEFAULT 'default',

    INDEX `holidays_serviceId_idx`(`serviceId`),
    INDEX `holidays_year_idx`(`year`),
    UNIQUE INDEX `holidays_date_serviceId_key`(`date`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `solde_conges` (
    `id` VARCHAR(191) NOT NULL,
    `gestionnaireId` VARCHAR(191) NOT NULL,
    `annee` INTEGER NOT NULL DEFAULT 2026,
    `vacancesAnnuelles` INTEGER NOT NULL DEFAULT 0,
    `consultationMedicale` INTEGER NOT NULL DEFAULT 0,
    `forceMajeure` INTEGER NOT NULL DEFAULT 0,
    `congesReglementaires` INTEGER NOT NULL DEFAULT 0,
    `creditHeures` INTEGER NOT NULL DEFAULT 0,
    `heuresSupplementaires` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `solde_conges_gestionnaireId_annee_key`(`gestionnaireId`, `annee`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conges` (
    `id` VARCHAR(191) NOT NULL,
    `gestionnaireId` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `reason` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `conges_gestionnaireId_idx`(`gestionnaireId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_adresseId_fkey` FOREIGN KEY (`adresseId`) REFERENCES `adresses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_dossierPrecedentId_fkey` FOREIGN KEY (`dossierPrecedentId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_geographicalSectorId_fkey` FOREIGN KEY (`geographicalSectorId`) REFERENCES `secteurs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_gestionnaireId_fkey` FOREIGN KEY (`gestionnaireId`) REFERENCES `gestionnaires`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_streetId_fkey` FOREIGN KEY (`streetId`) REFERENCES `rues`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `problematiques` ADD CONSTRAINT `problematiques_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `actions_suivi` ADD CONSTRAINT `actions_suivi_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gestionnaires` ADD CONSTRAINT `gestionnaires_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dropdown_options` ADD CONSTRAINT `dropdown_options_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rues` ADD CONSTRAINT `rues_geographicalSectorId_fkey` FOREIGN KEY (`geographicalSectorId`) REFERENCES `secteurs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prestations` ADD CONSTRAINT `prestations_gestionnaireId_fkey` FOREIGN KEY (`gestionnaireId`) REFERENCES `gestionnaires`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prestations` ADD CONSTRAINT `prestations_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `holidays` ADD CONSTRAINT `holidays_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solde_conges` ADD CONSTRAINT `solde_conges_gestionnaireId_fkey` FOREIGN KEY (`gestionnaireId`) REFERENCES `gestionnaires`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conges` ADD CONSTRAINT `conges_gestionnaireId_fkey` FOREIGN KEY (`gestionnaireId`) REFERENCES `gestionnaires`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

