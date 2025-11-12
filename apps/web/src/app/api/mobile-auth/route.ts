import { prisma } from "@/prisma";
import { encode } from "next-auth/jwt";

async function findOrCreateUser({
  email,
  username,
  walletAddress,
}: {
  email: string;
  username: string;
  walletAddress: string;
}) {
  return await prisma.user.upsert({
    where: { email },
    update: { username, walletAddress },
    create: { email, username, walletAddress },
  });
}

export async function POST(request: Request) {
  // Verify X-AUTH-KEY
  const authKey = request.headers.get("x-auth-key");

  if (authKey !== process.env.X_AUTH_KEY) {
    return Response.json({ message: "Invalid API key" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!body) {
    return Response.json({ message: "No body provided" }, { status: 400 });
  }

  const { email, username, walletAddress } = body;

  if (!email || !username || !walletAddress) {
    return Response.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const user = await findOrCreateUser({
      email,
      username: username.toLowerCase(),
      walletAddress,
    });

    const token = await encode({
      token: {
        sub: user.id,
        email: user.email,
        username: user.username.toLowerCase(),
        walletAddress: user.walletAddress,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      },
      secret: process.env.AUTH_SECRET!,
    });

    return Response.json({
      success: true,
      user,
      sessionToken: token,
      message: "User authenticated successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
