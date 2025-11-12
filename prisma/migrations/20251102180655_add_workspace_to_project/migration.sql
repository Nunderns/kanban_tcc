-- DropIndex
DROP INDEX "public"."Project_workspaceId_idx";

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "color" TEXT DEFAULT '#3b82f6';
