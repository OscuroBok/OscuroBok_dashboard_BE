/*
  Warnings:

  - Made the column `restaurant_name` on table `restaurants` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `restaurants` MODIFY `restaurant_name` VARCHAR(191) NOT NULL,
    MODIFY `owner_name` VARCHAR(191) NULL;
