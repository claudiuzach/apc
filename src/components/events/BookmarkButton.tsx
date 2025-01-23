"use client";

import kyInstance from "@/lib/ky";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient, QueryKey } from "@tanstack/react-query";
import { Bookmark, Save } from "lucide-react";
import { useToast } from "../ui/use-toast";

interface EventBookmarkButtonProps {
  eventId: string;
}

export default function EventBookmarkButton({ eventId }: EventBookmarkButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["event-bookmark-info", eventId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/events/${eventId}/bookmark`).json<{ isBookmarkedByUser: boolean }>(),
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data?.isBookmarkedByUser
        ? kyInstance.delete(`/api/events/${eventId}/bookmark`)
        : kyInstance.post(`/api/events/${eventId}/bookmark`),
    onMutate: async () => {
      toast({
        description: `Event ${data?.isBookmarkedByUser ? "un" : ""}bookmarked`,
      });

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<{ isBookmarkedByUser: boolean }>(queryKey);

      queryClient.setQueryData(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Save
        className={cn(
          "size-5",
          data?.isBookmarkedByUser && "fill-primary text-primary",
        )}
      />
    </button>
  );
}
