/*
  Warnings:

  - You are about to drop the column `isTrimmed` on the `VideoData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VideoData" DROP COLUMN "isTrimmed",
ADD COLUMN     "isEdited" BOOLEAN NOT NULL DEFAULT false;
