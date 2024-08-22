/*
  Warnings:

  - You are about to drop the column `whats_app_no` on the `restaurants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[aadhar_no]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passport_no]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reg_cert_no]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fssai_no]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gstin_no]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.
  - Made the column `rating` on table `restaurants` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `restaurants` DROP COLUMN `whats_app_no`,
    ADD COLUMN `average_price` INTEGER NULL,
    ADD COLUMN `bank_ac_name` VARCHAR(191) NULL,
    ADD COLUMN `bank_ac_no` VARCHAR(191) NULL,
    ADD COLUMN `bank_branch` VARCHAR(191) NULL,
    ADD COLUMN `bank_ifsc` VARCHAR(191) NULL,
    ADD COLUMN `bank_micr` VARCHAR(191) NULL,
    ADD COLUMN `bank_name` VARCHAR(191) NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `restaurant_verification` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    ADD COLUMN `restaurant_verification_remarks` VARCHAR(191) NOT NULL DEFAULT 'Verification is pending.',
    ADD COLUMN `whatsapp_no` VARCHAR(191) NULL,
    MODIFY `restaurant_name` VARCHAR(191) NULL,
    MODIFY `rating` DOUBLE NOT NULL DEFAULT 0.0;

-- CreateIndex
CREATE UNIQUE INDEX `restaurants_aadhar_no_key` ON `restaurants`(`aadhar_no`);

-- CreateIndex
CREATE UNIQUE INDEX `restaurants_passport_no_key` ON `restaurants`(`passport_no`);

-- CreateIndex
CREATE UNIQUE INDEX `restaurants_reg_cert_no_key` ON `restaurants`(`reg_cert_no`);

-- CreateIndex
CREATE UNIQUE INDEX `restaurants_fssai_no_key` ON `restaurants`(`fssai_no`);

-- CreateIndex
CREATE UNIQUE INDEX `restaurants_gstin_no_key` ON `restaurants`(`gstin_no`);
