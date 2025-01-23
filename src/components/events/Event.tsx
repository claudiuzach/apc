"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { EventData, Media } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import JoinButton from "./JoinButton";
import EventMoreButton from "./EventMoreButton";
import Image from "next/image";

interface EventProps {
  event: EventData;
}

export default function Event({ event }: EventProps) {
  const { user } = useSession();

  // Function to format date and time
  const formatEventDate = (date: string) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <article className="group/event space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={event.user}>
            <Link href={`/users/${event.user.username}`}>
              <UserAvatar avatarUrl={event.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={event.user}>
              <Link
                href={`/users/${event.user.username}`}
                className="block font-medium hover:underline"
              >
                {event.user.displayName}
              </Link>
            </UserTooltip>
            {/* Display the event posted date */}
            <span className="block text-sm text-muted-foreground">
              Event posted on: {formatEventDate(event.createdAt.toString())}
            </span>
            {/* Display the event planned date */}
            <span className="block text-sm text-muted-foreground">
              Event planned for: {formatEventDate(event.date.toString())}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Join button */}
          <JoinButton
            eventId={event.id}
            initialState={{
              joins: event._count.joins,
              isJoinedByUser: user
                ? event.joins.some((join) => join.userId === user.id)
                : false,
            }}
          />
          {/* EventMoreButton (only visible if the current user is the creator of the event) */}
          {user && user.id === event.user.id && <EventMoreButton event={event} />}
        </div>
      </div>
      <h2 className="text-lg font-semibold">{event.title}</h2>
      <Linkify>
        <div className="whitespace-pre-line break-words">{event.content}</div>
      </Linkify>
      {Array.isArray(event.attachments) && event.attachments.length > 0 && (
        <MediaPreviews attachments={event.attachments} />
      )}
      <hr className="text-muted-foreground" />
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments = [] }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((m) => (
        <MediaPreview key={m.id} media={m} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
  if (!media.url) {
    return <p className="text-destructive">Media URL missing</p>;
  }

  if (media.type === "IMAGE") {
    return (
      <Image
        src={media.url}
        alt="Attachment"
        width={500}
        height={500}
        className="mx-auto size-fit max-h-[30rem] rounded-2xl"
      />
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          src={media.url}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        />
      </div>
    );
  }

  console.warn("Unsupported media type:", media.type);
  return <p className="text-destructive">Unsupported media type</p>;
}
