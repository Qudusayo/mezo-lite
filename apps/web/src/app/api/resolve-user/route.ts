import { prisma } from "@/prisma";
import { requireValidSession } from "@/utils/session";

export async function POST(request: Request) {
  try {
    const session = await requireValidSession(request);

    if (!session.valid || !session.user) {
      return Response.json({ message: "Invalid session" }, { status: 401 });
    }

    const { payload } = await request.json();

    // Payload could be username or phone number
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: payload }, { phoneNumber: payload }],
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("User resolution error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
