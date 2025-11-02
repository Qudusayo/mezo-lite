import { prisma } from "@/prisma";
import { requireValidSession } from "@/utils/session";

async function createCashlink({
  code,
  transactionHash,
  userPhoneNumber,
}: {
  code: string;
  transactionHash: string;
  userPhoneNumber: string;
}) {
  const data = { code, userPhoneNumber, transactionHash };
  console.log("Data:", data);
  return await prisma.cashlink.create({ data });
}

export async function GET(request: Request) {
  try {
    const session = await requireValidSession(request);

    if (!session.valid || !session.user) {
      return Response.json({ message: "Invalid session" }, { status: 401 });
    }

    // Get all cashlinks for the user
    const cashlinks = await prisma.cashlink.findMany({
      where: { userPhoneNumber: session.user.phoneNumber },
      select: {
        code: true,
        transactionHash: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Let the response be like an object with  <txhash>: <code>
    const response = cashlinks.reduce(
      (acc: Record<string, string>, cashlink: { code: string; transactionHash: string }) => {
        acc[cashlink.transactionHash] = cashlink.code;
        return acc;
      },
      {}
    );

    return Response.json(response);
  } catch (error) {
    console.error("Cash-link retrieval error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Validate user session
    const session = await requireValidSession(request);

    if (!session.valid || !session.user) {
      return Response.json({ message: "Invalid session" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    if (!body) {
      return Response.json({ message: "No body provided" }, { status: 400 });
    }

    const { code, transactionHash } = body;

    if (!code || !transactionHash) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const cashlink = await createCashlink({
      code,
      transactionHash,
      userPhoneNumber: session.user.phoneNumber,
    });

    return Response.json({
      success: true,
      cashlink,
      message: "Cashlink created successfully",
    });
  } catch (error) {
    console.error("Cash-link creation error:", error);

    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
