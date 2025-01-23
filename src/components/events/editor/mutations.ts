import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import { EventsPage } from "@/lib/types"; // Ensure this type matches the structure of your events
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
            // Ensure the newEvent structure matches the type expected in EventsPage
            const updatedEvent = {
              ...newEvent,
              user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                createdAt: new Date(), // Assuming you want to set the created date to now
                followers: [], // Set followers as necessary, or omit if not required
                _count: {
                  events: 0, // You can set appropriate counts if available
                  posts: 0,
                  followers: 0,
                },
              },
              attendees: [], // Assuming no attendees initially
              _count: {
                attendees: 0, // Set the attendee count
              },
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
