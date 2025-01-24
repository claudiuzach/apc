import { EventsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { deleteEvent } from "./actions";

export function useDeleteEventMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: async (deletedEvent) => {
      const queryFilter: QueryFilters<InfiniteData<EventsPage, string | null>, Error, InfiniteData<EventsPage, string | null>, readonly unknown[]> = { queryKey: ["event-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<EventsPage, string | null>>(queryFilter, (oldData) => {
        if (!oldData) return;

        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map((page) => ({
            nextCursor: page.nextCursor,
            events: page.events.filter((e) => e.id !== deletedEvent.id),
          })),
        };
      });

      toast({
        description: "Event deleted",
      });

      if (pathname === `/events/${deletedEvent.id}`) {
        router.push(`/users/${deletedEvent.user.username}`);
      }
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete event. Please try again.",
      });
    },
  });

  return mutation;
}
