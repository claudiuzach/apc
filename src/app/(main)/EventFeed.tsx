"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Event from "@/components/events/Event"; // Assuming you have an Event component
import EventsLoadingSkeleton from "@/components/events/EventLoadingSkeleton"; // Create a loading skeleton for events
import kyInstance from "@/lib/ky";
import { EventsPage } from "@/lib/types"; // Update to your events types
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function EventFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["event-feed", "for-you"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/events/for-you", // Change to your event API endpoint
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<EventsPage>(), // Change to your event page type
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor, // Assuming your API returns a nextCursor for pagination
  });

  const events = data?.pages.flatMap((page) => page.events) || []; // Update to access events

  if (status === "pending") {
    return <EventsLoadingSkeleton />; // Create a loading skeleton for events
  }

  if (status === "success" && !events.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        No events available yet.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading events.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {events.map((event) => (
        <Event key={event.id} event={event} /> // Render each event
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
