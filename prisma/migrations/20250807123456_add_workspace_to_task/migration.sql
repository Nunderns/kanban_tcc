-- Add workspaceId column to Task
ALTER TABLE "Task" ADD COLUMN "workspaceId" INTEGER;

-- Add foreign key constraint
ALTER TABLE "Task" ADD CONSTRAINT "Task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index on workspaceId
CREATE INDEX "Task_workspaceId_idx" ON "Task"("workspaceId");
