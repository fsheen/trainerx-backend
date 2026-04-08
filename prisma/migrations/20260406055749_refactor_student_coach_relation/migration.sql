-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `openid` VARCHAR(191) NOT NULL,
    `unionid` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `nickname` VARCHAR(191) NULL,
    `gender` INTEGER NOT NULL DEFAULT 0,
    `birthday` DATETIME(3) NULL,
    `height` INTEGER NULL,
    `weight` INTEGER NULL,
    `goal` VARCHAR(191) NULL,
    `role` INTEGER NOT NULL DEFAULT 1,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `level` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_openid_key`(`openid`),
    UNIQUE INDEX `users_unionid_key`(`unionid`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    INDEX `users_openid_idx`(`openid`),
    INDEX `users_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coaches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `gender` INTEGER NOT NULL DEFAULT 0,
    `experience` INTEGER NOT NULL DEFAULT 0,
    `specialty` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `certificates` VARCHAR(191) NULL,
    `rating` DECIMAL(65, 30) NOT NULL DEFAULT 5.000000000000000000000000000000,
    `totalSessions` INTEGER NOT NULL DEFAULT 0,
    `price` INTEGER NOT NULL DEFAULT 0,
    `verificationStatus` INTEGER NOT NULL DEFAULT 0,
    `verificationReason` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `reviewedBy` INTEGER NULL,
    `reviewedAt` DATETIME(3) NULL,
    `phone` VARCHAR(191) NULL,
    `birthday` DATETIME(3) NULL,
    `workExperience` VARCHAR(191) NULL,
    `achievements` VARCHAR(191) NULL,
    `maxStudents` INTEGER NOT NULL DEFAULT 50,
    `activeStudents` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `coaches_userId_key`(`userId`),
    INDEX `coaches_userId_idx`(`userId`),
    INDEX `coaches_status_idx`(`status`),
    INDEX `coaches_verificationStatus_idx`(`verificationStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coachId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` INTEGER NOT NULL,
    `duration` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `cover` VARCHAR(191) NULL,
    `maxStudents` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `courses_coachId_idx`(`coachId`),
    INDEX `courses_type_idx`(`type`),
    INDEX `courses_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `coachId` INTEGER NOT NULL,
    `courseId` INTEGER NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `note` VARCHAR(191) NULL,
    `cancelReason` VARCHAR(191) NULL,
    `totalPrice` INTEGER NOT NULL,
    `paidAmount` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `bookings_userId_idx`(`userId`),
    INDEX `bookings_coachId_idx`(`coachId`),
    INDEX `bookings_status_idx`(`status`),
    INDEX `bookings_startTime_idx`(`startTime`),
    INDEX `bookings_courseId_fkey`(`courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `type` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `images` VARCHAR(191) NULL,
    `duration` INTEGER NULL,
    `calories` INTEGER NULL,
    `weight` DECIMAL(65, 30) NULL,
    `mood` INTEGER NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `comments` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `checkins_userId_idx`(`userId`),
    INDEX `checkins_type_idx`(`type`),
    INDEX `checkins_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coach_schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coachId` INTEGER NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `coach_schedules_coachId_idx`(`coachId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `coachId` INTEGER NOT NULL,
    `bookingId` INTEGER NULL,
    `rating` INTEGER NOT NULL,
    `content` VARCHAR(191) NULL,
    `images` VARCHAR(191) NULL,
    `isAnonymous` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `reviews_coachId_idx`(`coachId`),
    INDEX `reviews_userId_idx`(`userId`),
    INDEX `reviews_rating_idx`(`rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `training_plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coachId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `goals` VARCHAR(191) NOT NULL,
    `difficulty` INTEGER NOT NULL DEFAULT 1,
    `duration` INTEGER NOT NULL,
    `exercises` JSON NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `training_plans_coachId_idx`(`coachId`),
    INDEX `training_plans_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_coaches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `coachId` INTEGER NOT NULL,
    `courseCount` INTEGER NOT NULL DEFAULT 0,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `student_coaches_studentId_idx`(`studentId`),
    INDEX `student_coaches_coachId_idx`(`coachId`),
    INDEX `student_coaches_status_idx`(`status`),
    UNIQUE INDEX `student_coaches_studentId_coachId_key`(`studentId`, `coachId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_coaches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `coachId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_coaches_userId_key`(`userId`),
    INDEX `user_coaches_userId_idx`(`userId`),
    INDEX `user_coaches_coachId_idx`(`coachId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coach_applications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `gender` INTEGER NOT NULL DEFAULT 0,
    `birthday` DATETIME(3) NULL,
    `specialty` VARCHAR(191) NULL,
    `experience` INTEGER NOT NULL DEFAULT 0,
    `description` VARCHAR(191) NULL,
    `price` INTEGER NOT NULL DEFAULT 0,
    `certificates` VARCHAR(191) NULL,
    `workExperience` VARCHAR(191) NULL,
    `achievements` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `reason` VARCHAR(191) NULL,
    `reviewedBy` INTEGER NULL,
    `reviewedAt` DATETIME(3) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `coach_applications_userId_key`(`userId`),
    INDEX `coach_applications_userId_idx`(`userId`),
    INDEX `coach_applications_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NULL,
    `data` JSON NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_userId_idx`(`userId`),
    INDEX `notifications_isRead_idx`(`isRead`),
    INDEX `notifications_type_idx`(`type`),
    INDEX `notifications_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
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
    `inviteCode` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `students_inviteCode_key`(`inviteCode`),
    INDEX `students_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_wechats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `wechatOpenId` VARCHAR(191) NOT NULL,
    `wechatUnionId` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `confirmed` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `student_wechats_wechatOpenId_key`(`wechatOpenId`),
    INDEX `student_wechats_studentId_idx`(`studentId`),
    INDEX `student_wechats_phone_idx`(`phone`),
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
    `deleted_at` DATETIME(3) NULL,

    INDEX `student_course_packages_studentId_idx`(`studentId`),
    INDEX `student_course_packages_coachId_idx`(`coachId`),
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

    INDEX `course_sessions_coachId_idx`(`coachId`),
    INDEX `course_sessions_studentId_idx`(`studentId`),
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

    INDEX `weight_records_studentId_idx`(`studentId`),
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

    INDEX `course_templates_coachId_idx`(`coachId`),
    INDEX `course_templates_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `coaches` ADD CONSTRAINT `coaches_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkins` ADD CONSTRAINT `checkins_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coach_schedules` ADD CONSTRAINT `coach_schedules_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `training_plans` ADD CONSTRAINT `training_plans_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coach_applications` ADD CONSTRAINT `coach_applications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coach_applications` ADD CONSTRAINT `coach_applications_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_course_packages` ADD CONSTRAINT `student_course_packages_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_course_packages` ADD CONSTRAINT `student_course_packages_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_sessions` ADD CONSTRAINT `course_sessions_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_sessions` ADD CONSTRAINT `course_sessions_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_sessions` ADD CONSTRAINT `course_sessions_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `student_course_packages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weight_records` ADD CONSTRAINT `weight_records_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_templates` ADD CONSTRAINT `course_templates_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
