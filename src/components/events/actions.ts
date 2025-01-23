"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getEventDataInclude } from "@/lib/types"; // Update the import to reflect event data

export async function deleteEvent(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const event = await prisma.event.findUnique({ // Change 'post' to 'event'
    where: { id },
  });

  if (!event) throw new Error("Event not found"); // Change the error message

  if (event.userId !== user.id) throw new Error("Unauthorized");

  const deletedEvent = await prisma.event.delete({ // Change 'post' to 'event'
    where: { id },
    include: getEventDataInclude(user.id), // Update to include event-specific data
  });

  return deletedEvent;
}
