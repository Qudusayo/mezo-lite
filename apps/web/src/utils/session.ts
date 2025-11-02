import { decode } from "next-auth/jwt";
import { prisma } from "@/prisma";

export interface SessionUser {
  id: string;
  phoneNumber: string;
  username: string;
  walletAddress: string;
}

export interface SessionValidationResult {
  valid: boolean;
  user?: SessionUser;
  message?: string;
}

/**
 * Validates a JWT session token and returns user information if valid
 */
export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  try {
    if (!token) {
      return { valid: false, message: "No token provided" };
    }

    // Decode and validate the JWT token
    const decoded = await decode({
      token,
      secret: process.env.AUTH_SECRET!,
    });

    if (!decoded) {
      return { valid: false, message: "Invalid token" };
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && typeof decoded.exp === 'number' && decoded.exp < currentTime) {
      return { valid: false, message: "Token expired" };
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub as string },
      select: {
        id: true,
        phoneNumber: true,
        username: true,
        walletAddress: true,
      },
    });

    if (!user) {
      return { valid: false, message: "User not found" };
    }

    return {
      valid: true,
      user,
      message: "Session is valid",
    };
  } catch (error) {
    console.error("Session validation error:", error);
    return { valid: false, message: "Internal server error" };
  }
}

/**
 * Extracts and validates session token from Authorization header
 */
export async function validateSessionFromHeader(authHeader: string | null): Promise<SessionValidationResult> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, message: "No valid authorization header" };
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  return validateSessionToken(token);
}

/**
 * Middleware function to validate session for API routes
 */
export async function requireValidSession(request: Request): Promise<SessionValidationResult> {
  const authHeader = request.headers.get("authorization");
  const result = await validateSessionFromHeader(authHeader);
  
  if (!result.valid) {
    throw new Error(result.message || "Invalid session");
  }
  
  return result;
}
