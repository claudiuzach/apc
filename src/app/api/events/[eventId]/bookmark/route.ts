import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Get bookmark status for the user
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookmark = await prisma.eventBookmark.findUnique({
    where: {
      userId_eventId: { userId: user.id, eventId: params.id },
    },
  });

  return NextResponse.json({ isBookmarkedByUser: !!bookmark });
}

// Bookmark an event
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookmark = await prisma.eventBookmark.create({
    data: {
      userId: user.id,
      eventId: params.id,
    },
  });

  return NextResponse.json(bookmark);
}

// Remove bookmark from an event
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.eventBookmark.delete({
    where: {
      userId_eventId: { userId: user.id, eventId: params.id },
    },
  });

  return NextResponse.json({ success: true });
}
