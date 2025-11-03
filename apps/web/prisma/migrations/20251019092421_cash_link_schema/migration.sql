-- DropForeignKey
ALTER TABLE "public"."Cashlink" DROP CONSTRAINT "Cashlink_userPhoneNumber_fkey";

-- AddForeignKey
ALTER TABLE "Cashlink" ADD CONSTRAINT "Cashlink_userPhoneNumber_fkey" FOREIGN KEY ("userPhoneNumber") REFERENCES "User"("phoneNumber") ON DELETE CASCADE ON UPDATE CASCADE;
