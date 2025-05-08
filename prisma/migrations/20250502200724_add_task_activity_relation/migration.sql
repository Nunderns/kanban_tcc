-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "assignees" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "labels" SET DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");
