import { validateSessionFromHeader } from "@/utils/session";

export async function POST(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get("authorization");
    const result = await validateSessionFromHeader(authHeader);
    
    const status = result.valid ? 200 : 401;
    return Response.json(result, { status });
  } catch (error) {
    console.error("Session validation error:", error);
    return Response.json(
      { valid: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support GET for simple token validation
export async function GET(request: Request): Promise<Response> {
  return POST(request);
}
