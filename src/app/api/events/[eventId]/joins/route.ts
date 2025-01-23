import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { JoinInfo } from "@/lib/types"; // Adjust this import as necessary

export async function GET(
  req: Request,
  { params: { eventId } }: { params: { eventId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        joins: {
          where: {
            userId: loggedInUser.id,
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            joins: true,
          },
        },
      },
    });

    if (!event) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    const data: JoinInfo = {
      joins: event._count.joins,
      isJoinedByUser: !!event.joins.length,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params: { eventId } }: { params: { eventId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        userId: true,
      },
    });

    if (!event) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.join.upsert({
        where: {
          userId_eventId: {
            userId: loggedInUser.id,
            eventId,
          },
        },
        create: {
          userId: loggedInUser.id,
          eventId,
        },
        update: {},
      }),
      ...(loggedInUser.id !== event.userId
        ? [
            prisma.notification.create({
              data: {
                issuerId: loggedInUser.id,
                recipientId: event.userId,
                eventId,
                type: "JOIN", // Change to JOIN type if you have a specific type
              },
            }),
          ]
        : []),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params: { eventId } }: { params: { eventId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        userId: true,
      },
    });

    if (!event) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.join.deleteMany({
        where: {
          userId: loggedInUser.id,
          eventId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: event.userId,
          eventId,
          type: "JOIN", // Change to JOIN type if you have a specific type
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
