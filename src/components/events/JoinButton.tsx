import kyInstance from "@/lib/ky"; // Import your HTTP client
import { JoinInfo } from "@/lib/types"; // Import the type for join info
import { cn } from "@/lib/utils"; // Utility for class names
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"; // React Query for data fetching
import { UserPlus } from "lucide-react"; // Icon for joining
import { useToast } from "../ui/use-toast"; // Toast notifications

interface JoinButtonProps {
  eventId: string; // The ID of the event
  initialState: JoinInfo; // Initial state containing join information
}

export default function JoinButton({ eventId, initialState }: JoinButtonProps) {
  const { toast } = useToast(); // Toast for notifications
  const queryClient = useQueryClient(); // Instance of query client

  const queryKey: QueryKey = ["join-info", eventId]; // Query key for the event joins

  // Fetch the current join state for the event
  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/events/${eventId}/joins`).json<JoinInfo>(),
    initialData: initialState, // Set initial data
    staleTime: Infinity, // Prevent re-fetching
  });

  // Mutation for joining/leaving the event
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isJoinedByUser
        ? kyInstance.delete(`/api/events/${eventId}/joins`) // Leave event
        : kyInstance.post(`/api/events/${eventId}/joins`), // Join event
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey }); // Cancel any ongoing queries

      const previousState = queryClient.getQueryData<JoinInfo>(queryKey); // Get previous join state

      // Optimistically update the query data
      queryClient.setQueryData<JoinInfo>(queryKey, () => ({
        joins:
          (previousState?.joins || 0) + (previousState?.isJoinedByUser ? -1 : 1), // Update joins count
        isJoinedByUser: !previousState?.isJoinedByUser, // Toggle join state
      }));

      return { previousState }; // Return previous state for rollback if needed
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState); // Rollback to previous state
      console.error(error); // Log the error
      toast({
        variant: "destructive", // Show error toast
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <UserPlus
        className={cn(
          "size-5",
          data.isJoinedByUser && "fill-green-500 text-green-500", // Change icon color if joined
        )}
      />
      <span className="text-sm font-medium tabular-nums">
        {data.joins} <span className="hidden sm:inline">joins</span>
      </span>
    </button>
  );
}
