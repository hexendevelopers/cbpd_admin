import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export interface AdminTokenData {
  adminId: string;
  email: string;
  role: string;
  permissions: {
    institutions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      approve: boolean;
    };
    students: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
    admins: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
}

export async function verifyAdminToken(
  request: NextRequest
): Promise<AdminTokenData | null> {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminTokenData;
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Enhanced function to get token from multiple sources
function getTokenFromRequest(request?: NextRequest): string | null {
  let token: string | null = null;

  if (request) {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // If not found in header, try cookies
    if (!token) {
      token = request.cookies.get("authToken")?.value || null;
    }
  } else {
    // Server-side: Try cookies using Next.js cookies() function
    try {
      const cookieStore = cookies();
      token = cookieStore.get("authToken")?.value || null;
    } catch (error) {
      console.error("Error accessing cookies:", error);
    }
  }

  return token;
}
/**
 * Verifies the JWT token for an institution user.
 *
 * This function attempts to extract and validate a JWT token from either the request
 * headers or cookies. It's used to authenticate institution users before allowing
 * access to protected resources.
 *
 * @param request - The Next.js request object, if available. When provided, the function
 *                  will attempt to extract the token from this request's headers or cookies.
 *                  If not provided, the function will try to access cookies from the server context.
 *
 * @returns A promise that resolves to an object containing either:
 *          - On success: { success: true, user: DecodedToken } where DecodedToken contains the JWT payload
 *          - On failure: { error: string, status: number, debug: string } with details about the authentication failure
 */

export async function verifyInstitutionToken(request?: NextRequest) {
  const token = getTokenFromRequest(request);

  if (!token) {
    return {
      error: "Not authorized, token missing",
      status: 401,
      debug: "Token not found in cookies or Authorization header",
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return { success: true, user: decoded };
  } catch (err: any) {
    return {
      error: "Invalid token",
      status: 401,
      debug: `JWT verification failed: ${err.message}`,
    };
  }
}

export async function protectOrg(request?: NextRequest) {
  const token = getTokenFromRequest(request);

  if (!token) {
    return {
      error: "Not authorized, token missing",
      status: 401,
      debug: "Token not found in cookies or Authorization header",
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return { success: true, user: decoded };
  } catch (err: any) {
    return {
      error: "Invalid token",
      status: 401,
      debug: `JWT verification failed: ${err.message}`,
    };
  }
}
