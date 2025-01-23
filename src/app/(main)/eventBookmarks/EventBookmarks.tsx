"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import kyInstance from "@/lib/ky";
import { EventsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function EventBookmarks() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["event-feed", "bookmarks"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/events/bookmarked",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<EventsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const events = data?.pages.flatMap((page) => page.events) || [];

  if (status === "pending") {
    return <p>Loading...</p>; // Replace with a skeleton if needed
  }

  if (status === "success" && !events.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        You don&apos;t have any bookmarked events yet.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading bookmarked events.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {events.map((event) => (
        <div key={event.id} className="rounded border p-4 shadow-sm">
          <h3 className="text-lg font-bold">{event.title}</h3>
          <p className="text-sm text-muted-foreground">{event.content}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(event.date).toLocaleDateString()}
          </p>
        </div>
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
