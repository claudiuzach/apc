import { NextRequest, NextResponse } from 'next/server'; // Use NextRequest for app directory
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { latitude, longitude } = await req.json(); // Using the correct method to get JSON data

    // Validate input
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    // Update user's location
    await prisma.user.update({
      where: { id: user.id },
      data: { latitude, longitude },
    });

    return NextResponse.json({ message: "Location updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
