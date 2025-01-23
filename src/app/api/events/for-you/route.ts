import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getEventDataInclude, EventsPage } from "@/lib/types"; // Ensure you have a similar method for events
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch events from the database
    const events = await prisma.event.findMany({
      include: getEventDataInclude(user.id), // Adjust this function to include necessary event data
      orderBy: { createdAt: "desc" }, // Assuming events also have a createdAt field
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    // Determine the next cursor
    const nextCursor = events.length > pageSize ? events[pageSize].id : null;

    const data: EventsPage = {
      events: events.slice(0, pageSize), // Slice to only return the requested number of events
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
