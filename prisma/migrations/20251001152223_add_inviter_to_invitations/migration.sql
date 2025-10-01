-- Add the column as nullable first
ALTER TABLE "public"."Invitation" ADD COLUMN "inviterId" INTEGER;

-- Set a default value for existing rows (use the first admin user we can find)
UPDATE "public"."Invitation" 
SET "inviterId" = (
  SELECT "id" 
  FROM "public"."User" 
  WHERE "email" LIKE '%admin%' OR "email" LIKE '%henri%' OR "id" = 1
  LIMIT 1
)
WHERE "inviterId" IS NULL;

-- If no user was found, use ID 1 as fallback
UPDATE "public"."Invitation" 
SET "inviterId" = 1
WHERE "inviterId" IS NULL;

-- Now make the column NOT NULL
ALTER TABLE "public"."Invitation" ALTER COLUMN "inviterId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
