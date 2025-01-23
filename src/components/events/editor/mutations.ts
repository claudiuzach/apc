import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import { EventsPage, EventData } from "@/lib/types"; // Ensure this type matches the structure of your events
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitEvent } from "./actions"; // Ensure this points to your event submission function

export function useSubmitEventMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useSession();

  const mutation = useMutation({
    mutationFn: submitEvent,
    onSuccess: async (newEvent) => {
      const queryFilter = {
        queryKey: ["event-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("events") ||
            (query.queryKey.includes("user-events") &&
              query.queryKey.includes(user.id))
          );
        },
      } satisfies QueryFilters;

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<EventsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            // Constructing the updatedEvent to match EventData type
            //@ts-ignore
            const updatedEvent: EventData = {
              ...newEvent,
              user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                bio: null,
                status: "ACTIVE",
                createdAt: new Date(),
                followers: [], // Ensure this matches the User's followers structure
                joins: [{ userId: user.id, eventId: newEvent.id }], // Correctly includes eventId
                _count: {
                  posts: 0,
                  followers: 0,
                  joins: 1, // This should match the number of joins for this event
                },
              },
              attendees: [], // Initial empty array for attendees
              attachments: [], // Initial empty array for attachments
              bookmarks: [], // Initial empty array for bookmarks
              _count: {
                attendees: 0,
                bookmarks: 0,
                joins: 1, // Ensure this matches the number of joins
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  events: [updatedEvent, ...firstPage.events], // Add new event to the first page
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }

          return oldData; // Return old data if firstPage is not available
        },
      );

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return queryFilter.predicate(query) && !query.state.data;
        },
      });

      toast({
        description: "Event created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to create event. Please try again.",
      });
    },
  });

  return mutation;
}
