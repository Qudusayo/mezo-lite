import { prisma } from "@/prisma";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

async function findOrCreateUser({
  phoneNumber,
  username,
  walletAddress,
}: {
  phoneNumber: string;
  username: string;
  walletAddress: string;
}) {
  return await prisma.user.upsert({
    where: { phoneNumber },
    update: { username, walletAddress },
    create: { phoneNumber, username, walletAddress },
  });
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "mobile-auth",
      name: "Mobile Auth",
      credentials: {
        phoneNumber: { label: "Phone Number", type: "text" },
        username: { label: "Username", type: "text" },
        walletAddress: { label: "Wallet Address", type: "text" },
        xAuthKey: { label: "X-AUTH-KEY", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("No credentials provided");
        }

        const { phoneNumber, username, walletAddress, xAuthKey } = credentials;

        if (xAuthKey !== process.env.X_AUTH_KEY) {
          throw new Error("Unauthorized");
        }

        // Check or create user in DB
        const user = await findOrCreateUser({
          phoneNumber,
          username,
          walletAddress,
        });

        if (!user) {
          throw new Error("User not found or created");
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  pages: {
    signIn: undefined,
    signOut: undefined,
    error: undefined,
    verifyRequest: undefined,
    newUser: undefined,
  },
});
