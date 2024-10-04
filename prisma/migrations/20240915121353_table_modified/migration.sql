/*
  Warnings:

  - You are about to drop the column `geo_loc_lat` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `geo_loc_lng` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `menu` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `restaurant_type` on the `restaurants` table. All the data in the column will be lost.
  - You are about to alter the column `address` on the `restaurants` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `services` on the `restaurants` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `types_of_cuisines` on the `restaurants` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `operational_days` on the `restaurants` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `location` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `restaurants` DROP COLUMN `geo_loc_lat`,
    DROP COLUMN `geo_loc_lng`,
    DROP COLUMN `menu`,
    DROP COLUMN `restaurant_type`,
    ADD COLUMN `followers` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `geo_location` JSON NULL,
    ADD COLUMN `night_life` VARCHAR(191) NOT NULL DEFAULT 'Restaurant',
    ADD COLUMN `order_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `total_sales` INTEGER NOT NULL DEFAULT 0,
    MODIFY `address` JSON NULL,
    MODIFY `services` JSON NULL,
    MODIFY `types_of_cuisines` JSON NULL,
    MODIFY `operational_days` JSON NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `gender` VARCHAR(191) NULL,
    MODIFY `location` JSON NULL;

-- CreateTable
CREATE TABLE `posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `restaurant_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `file_type` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `post_id` INTEGER NULL,
    `restaurant_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `files` ADD CONSTRAINT `files_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `files` ADD CONSTRAINT `files_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
