/*
  Warnings:

  - You are about to drop the `resturants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `resturants` DROP FOREIGN KEY `resturants_user_id_fkey`;

-- DropTable
DROP TABLE `resturants`;

-- CreateTable
CREATE TABLE `restaurants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `restaurant_name` VARCHAR(191) NOT NULL,
    `restaurant_code` VARCHAR(191) NOT NULL,
    `owner_name` VARCHAR(191) NOT NULL,
    `contact_no` VARCHAR(191) NOT NULL,
    `whats_app_no` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `geo_location` VARCHAR(191) NULL,
    `date_of_estd` VARCHAR(191) NULL,
    `biography` VARCHAR(191) NULL,
    `restaurant_capacity` INTEGER NULL,
    `restaurant_type` VARCHAR(191) NULL,
    `services` VARCHAR(191) NULL,
    `open_time` DATETIME(3) NULL,
    `close_time` DATETIME(3) NULL,
    `types_of_cuisines` VARCHAR(191) NULL,
    `operational_days` VARCHAR(191) NULL,
    `insta_link` VARCHAR(191) NULL,
    `fb_link` VARCHAR(191) NULL,
    `x_link` VARCHAR(191) NULL,
    `menu` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `cover_img` VARCHAR(191) NULL,
    `rating` DOUBLE NULL DEFAULT 0.0,
    `aadhar_no` VARCHAR(191) NULL,
    `passport_no` VARCHAR(191) NULL,
    `reg_cert_no` VARCHAR(191) NULL,
    `fssai_no` VARCHAR(191) NULL,
    `gstin_no` VARCHAR(191) NULL,
    `aadhar_file` VARCHAR(191) NULL,
    `passport_file` VARCHAR(191) NULL,
    `reg_cert_file` VARCHAR(191) NULL,
    `fssai_file` VARCHAR(191) NULL,
    `gstin_file` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `restaurants_contact_no_key`(`contact_no`),
    UNIQUE INDEX `restaurants_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `restaurants` ADD CONSTRAINT `restaurants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
