-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "isVoice" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;
