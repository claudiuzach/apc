"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createEventSchema } from "@/lib/validation";

export async function submitEvent(input: {
  title: string;
  content: string;
  date: string;
  mediaIds?: string[];
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  // Validate and parse the input using the schema
  const { title, content, date, mediaIds } = createEventSchema.parse(input);

  const newEvent = await prisma.event.create({
    data: {
      title,
      content,
      date: new Date(date),
      userId: user.id,
      attachments: mediaIds?.length
  ? {
      connect: mediaIds.map((id) => ({ id })),
  }
  : undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      joins: {
        select: {
          userId: true,
        },
      },
    },
  });

  return newEvent;
}
