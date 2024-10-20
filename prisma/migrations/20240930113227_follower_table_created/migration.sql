/*
  Warnings:

  - You are about to drop the column `followers` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `order_count` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `total_sales` on the `restaurants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `restaurants` DROP COLUMN `followers`,
    DROP COLUMN `order_count`,
    DROP COLUMN `total_sales`;

-- CreateTable
CREATE TABLE `followers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `restaurant_id` INTEGER NOT NULL,
    `isFollow` BOOLEAN NOT NULL DEFAULT true,
    `unfollowedReason` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `followers` ADD CONSTRAINT `followers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `followers` ADD CONSTRAINT `followers_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
