// src/app/(main)/api/get-current-user/route.ts
import { NextResponse } from "next/server";
import { validateRequest } from "@/auth"; // Adjust the import path based on your structure
import prisma from "@/lib/prisma"; // Ensure prisma is imported correctly

export async function GET() {
  const { user } = await validateRequest(); // Validate user session
  
  if (!user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  // Fetch user details
  const userDetails = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      email: true,
      status: true,
      role: true,
    },
  });

  if (!userDetails) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(userDetails);
}
