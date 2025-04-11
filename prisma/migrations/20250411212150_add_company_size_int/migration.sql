/*
  Warnings:

  - Added the required column `companySize` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `workspace` ADD COLUMN `companySize` INTEGER NOT NULL;
