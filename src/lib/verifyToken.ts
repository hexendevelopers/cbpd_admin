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

export async function verifyInstitutionToken(request: NextRequest) {
  try {
    const token = request.cookies.get("authToken")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch (error) {
    console.error("Institution token verification error:", error);
    return null;
  }
}

export async function protectOrg(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    return { error: "Not authorized, token missing in cookies", status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return { success: true, user: decoded };
  } catch (err) {
    return { error: "Invalid token", status: 401 };
  }
}
