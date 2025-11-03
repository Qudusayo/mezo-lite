-- DropForeignKey
ALTER TABLE "public"."Cashlink" DROP CONSTRAINT "Cashlink_userPhoneNumber_fkey";

-- DropIndex
DROP INDEX "public"."Cashlink_userPhoneNumber_key";

-- AddForeignKey
ALTER TABLE "Cashlink" ADD CONSTRAINT "Cashlink_userPhoneNumber_fkey" FOREIGN KEY ("userPhoneNumber") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
