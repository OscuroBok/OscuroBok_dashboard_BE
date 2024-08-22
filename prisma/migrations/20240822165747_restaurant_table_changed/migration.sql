/*
  Warnings:

  - You are about to drop the column `geo_location` on the `restaurants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `restaurants` DROP COLUMN `geo_location`,
    ADD COLUMN `geo_loc_lat` DOUBLE NULL,
    ADD COLUMN `geo_loc_lng` DOUBLE NULL,
    MODIFY `is_active` BOOLEAN NOT NULL DEFAULT true;
