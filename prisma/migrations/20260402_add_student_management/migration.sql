-- CreateTable
CREATE TABLE `students` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coachId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `gender` INTEGER NOT NULL DEFAULT 0,
    `birthday` DATETIME(3) NULL,
    `height` INTEGER NULL,
    `weight` DECIMAL(65, 30) NULL,
    `goal` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `students_coachId_fkey`(`coachId`),
    INDEX `students_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_course_packages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `coachId` INTEGER NOT NULL,
    `courseName` VARCHAR(191) NOT NULL,
    `totalSessions` INTEGER NOT NULL,
    `usedSessions` INTEGER NOT NULL DEFAULT 0,
    `remainingSessions` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `purchaseDate` DATETIME(3) NOT NULL,
    `expireDate` DATETIME(3) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `student_course_packages_studentId_fkey`(`studentId`),
    INDEX `student_course_packages_coachId_fkey`(`coachId`),
    INDEX `student_course_packages_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coachId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `packageId` INTEGER NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `duration` INTEGER NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `courseType` VARCHAR(191) NULL,
    `trainContent` VARCHAR(191) NULL,
    `studentState` VARCHAR(191) NULL,
    `coachNote` VARCHAR(191) NULL,
    `images` VARCHAR(191) NULL,
    `isDeducted` BOOLEAN NOT NULL DEFAULT false,
    `cancelReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `course_sessions_coachId_fkey`(`coachId`),
    INDEX `course_sessions_studentId_fkey`(`studentId`),
    INDEX `course_sessions_status_idx`(`status`),
    INDEX `course_sessions_startTime_idx`(`startTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weight_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `weight` DECIMAL(65, 30) NOT NULL,
    `bodyFat` DECIMAL(65, 30) NULL,
    `muscleMass` DECIMAL(65, 30) NULL,
    `note` VARCHAR(191) NULL,
    `recordDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    INDEX `weight_records_studentId_fkey`(`studentId`),
    INDEX `weight_records_recordDate_idx`(`recordDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coachId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `courseType` VARCHAR(191) NOT NULL,
    `duration` INTEGER NOT NULL,
    `exercises` JSON NOT NULL,
    `description` VARCHAR(191) NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `course_templates_coachId_fkey`(`coachId`),
    INDEX `course_templates_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_course_packages` ADD CONSTRAINT `student_course_packages_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_course_packages` ADD CONSTRAINT `student_course_packages_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_sessions` ADD CONSTRAINT `course_sessions_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_sessions` ADD CONSTRAINT `course_sessions_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_sessions` ADD CONSTRAINT `course_sessions_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `student_course_packages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weight_records` ADD CONSTRAINT `weight_records_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_templates` ADD CONSTRAINT `course_templates_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
