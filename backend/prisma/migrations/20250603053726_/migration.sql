/*
  Warnings:

  - You are about to drop the `SearchFilter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SearchFilter" DROP CONSTRAINT "SearchFilter_userId_fkey";

-- DropTable
DROP TABLE "SearchFilter";
