import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const loggedInUserId = searchParams.get("userId");

    console.log("🔍 Fetching users, excluding userId:", loggedInUserId);

    if (!loggedInUserId) {
      return NextResponse.json({ users: [] }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: loggedInUserId }, // Exclude logged-in user
        status: "ACTIVE",  // ✅ Ensure this status exists in your database
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
    });
    

    console.log("✅ Users found:", users);
    return NextResponse.json({ users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
