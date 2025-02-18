import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch the last user sorted by creation date
    const lastUser = await prisma.user.findFirst({
      orderBy: { createdAt: "desc" },
      select: { memberNumber: true },
    });

    if (!lastUser || !lastUser.memberNumber) {
      return NextResponse.json(1); // First user starts from 1
    }

    // Extract the last sequential number from memberNumber (e.g., "FC/ZA/1802251" -> 1)
    const match = lastUser.memberNumber.match(/(\d+)$/);
    const lastNumber = match ? parseInt(match[0], 10) : 0;

    return NextResponse.json(lastNumber + 1);
  } catch (error) {
    console.error("Error fetching last membership number:", error);
    return NextResponse.json({ error: "Failed to retrieve data" }, { status: 500 });
  }
}
