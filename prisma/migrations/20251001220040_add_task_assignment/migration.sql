-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "assignedUserId" INTEGER;

-- CreateIndex
CREATE INDEX "Task_assignedUserId_idx" ON "public"."Task"("assignedUserId");

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
