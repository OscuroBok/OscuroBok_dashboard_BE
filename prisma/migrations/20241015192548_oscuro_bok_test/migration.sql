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
