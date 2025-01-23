// src/app/(main)/api/update-user/route.ts
import { NextResponse } from "next/server";
import { validateRequest } from "@/auth"; // Adjust the import path
import prisma from "@/lib/prisma"; // Ensure prisma is imported correctly
import { UserStatus, UserRole } from "@prisma/client"; // Import necessary enums

export async function POST(request: Request) {
  const { user } = await validateRequest(); // Validate user session
  
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, status, role } = await request.json(); // Get userId, status, and role from request body

  // Update the user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      status,
      role,
    },
  });

  return NextResponse.json(updatedUser);
}
