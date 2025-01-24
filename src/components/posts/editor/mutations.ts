import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import { PostsPage } from "@/lib/types";
import {
  InfiniteData,
  Query,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./actions";

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useSession();

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      const queryFilter: QueryFilters<
        InfiniteData<PostsPage, string | null>, // Data type
        Error, // Error type
        InfiniteData<PostsPage, string | null>, // Variables type
        readonly unknown[] // QueryKey type
      > = {
        queryKey: ["post-feed"],
        predicate: (
          query: Query<
            InfiniteData<PostsPage, string | null>, // Data type
            Error, // Error type
            InfiniteData<PostsPage, string | null>, // Variables type
            readonly unknown[] // QueryKey type
          >
        ): boolean => {
          // Ensure that we always return a boolean
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(user.id))
          );
        },
      };

      // Cancel queries matching the filter
      await queryClient.cancelQueries(queryFilter);

      // Update the cache for matching queries
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return oldData; // Safeguard against undefined data

          const firstPage = oldData.pages[0];
          if (!firstPage) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: [
              {
                posts: [newPost, ...firstPage.posts],
                nextCursor: firstPage.nextCursor,
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      );

      // Invalidate queries only if `predicate` is defined
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate: (query) =>
          queryFilter.predicate?.(query as Query<
            InfiniteData<PostsPage, string | null>,
            Error,
            InfiniteData<PostsPage, string | null>,
            readonly unknown[]
          >) ?? false, // Safely fallback to `false` if predicate is undefined
      });

      toast({
        description: "Post created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
      });
    },
  });

  return mutation;
}
