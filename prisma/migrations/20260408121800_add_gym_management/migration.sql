-- CreateTable
CREATE TABLE `gyms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coachId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `isFavorite` BOOLEAN NOT NULL DEFAULT false,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `lastUsedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    INDEX `gyms_coachId_idx`(`coachId`),
    INDEX `gyms_isFavorite_idx`(`isFavorite`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `course_sessions` 
ADD COLUMN `gymId` INTEGER NULL,
ADD COLUMN `gymName` VARCHAR(191) NULL,
ADD COLUMN `gymAddress` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `course_sessions` 
ADD CONSTRAINT `course_sessions_gymId_fkey` 
FOREIGN KEY (`gymId`) REFERENCES `gyms`(`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;
