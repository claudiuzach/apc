import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import { EventsPage, EventData } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitEvent } from "./actions";

export function useSubmitEventMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useSession();

  const mutation = useMutation({
    mutationFn: submitEvent,
    onSuccess: async (newEvent) => {
      const queryFilter: QueryFilters<
        InfiniteData<EventsPage, string | null>,
        Error,
        InfiniteData<EventsPage, string | null>,
        readonly unknown[]
      > = {
        queryKey: ["event-feed"],
        predicate: (query) => {
          return (
            query.queryKey.includes("events") ||
            (query.queryKey.includes("user-events") &&
              query.queryKey.includes(user.id))
          );
        },
      };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<EventsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
          
// @ts-ignore
const updatedEvent: EventData = {
              ...newEvent,
              user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                bio: null, // Assuming bio can be null
                status: "ACTIVE", // Ensure status is of the correct type
                createdAt: new Date(), // Use appropriate date
                followers: [], // Ensure this aligns with your User type structure
                joins: [{ userId: user.id, eventId: newEvent.id }], // Correctly structure joins
                _count: {
                  posts: 0, // Adjust based on your application logic
                  followers: 0,
                  joins: 1, // Adjust to reflect the actual number of joins
                },
              },
              attendees: [], // Adjust based on your application logic
              attachments: [], // Adjust based on your application logic
              bookmarks: [], // Adjust based on your application logic
              _count: {
                attendees: 0, // Adjust as necessary
                bookmarks: 0, // Adjust as necessary
                joins: 1, // Update if necessary
              },
              createdAt: new Date(), // Adjust if the date comes from newEvent
              updatedAt: new Date(), // Include if necessary
              date: newEvent.date, // Ensure this field is provided if it's part of newEvent
            };
            

            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  events: [updatedEvent, ...firstPage.events],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }

          return oldData;
        },
      );

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate: (query) => {
          return queryFilter.predicate ? queryFilter.predicate(query as any) : false && !query.state.data;
        },
      });

      toast({
        description: "Event created successfully",
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
