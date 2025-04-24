-- CreateEnum
CREATE TYPE "Status" AS ENUM ('UPLOADED', 'FAILED', 'EDITING', 'NULL');

-- CreateTable
CREATE TABLE "VideoData" (
    "id" SERIAL NOT NULL,
    "videoName" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "size" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'NULL',

    CONSTRAINT "VideoData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoData_videoName_key" ON "VideoData"("videoName");
