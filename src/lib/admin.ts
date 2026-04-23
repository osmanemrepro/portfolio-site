import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getAdminFromToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return null;

  const admin = await db.adminUser.findUnique({
    where: { id: payload.adminId },
  });

  return admin;
}
