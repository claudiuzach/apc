import { PostsPage } from "@/lib/types";
import {
  InfiniteData,
  Query,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { deletePost } from "./actions";

export function useDeletePostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
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
          // Explicitly return a boolean
          return query.queryKey.includes("post-feed");
        },
      };

      // Cancel matching queries
      await queryClient.cancelQueries(queryFilter);

      // Update the cache for matching queries
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return undefined;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== deletedPost.id),
            })),
          };
        }
      );

      // Invalidate queries where `predicate` is true
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate: (query) =>
          queryFilter.predicate?.(query as Query<
            InfiniteData<PostsPage, string | null>,
            Error,
            InfiniteData<PostsPage, string | null>,
            readonly unknown[]
          >) ?? false, // Safely handle `undefined` predicate
      });

      toast({
        description: "Post deleted",
      });

      if (pathname === `/posts/${deletedPost.id}`) {
        router.push(`/users/${deletedPost.user.username}`);
      }
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete post. Please try again.",
      });
    },
  });

  return mutation;
}
