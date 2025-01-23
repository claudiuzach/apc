  import { validateRequest } from "@/auth";
  import Linkify from "@/components/Linkify";
  import Event from "@/components/events/Event"; 
  import UserAvatar from "@/components/UserAvatar";
  import UserTooltip from "@/components/UserTooltip";
  import JoinButton from "@/components/events/JoinButton"; 
  import prisma from "@/lib/prisma";
  import { getEventDataInclude, UserData } from "@/lib/types";
  import { Loader2 } from "lucide-react";
  import { Metadata } from "next";
  import Link from "next/link";
  import { notFound } from "next/navigation";
  import { cache, Suspense } from "react";

  interface PageProps {
    params: { eventId: string }; 
  }

  const getEvent = cache(async (eventId: string, loggedInUserId: string) => {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: getEventDataInclude(loggedInUserId),
    });
  
    if (!event) notFound();
  
    return event;
  });
  

  export async function generateMetadata({
    params: { eventId },
  }: PageProps): Promise<Metadata> {
    const { user } = await validateRequest(); 

    if (!user) return {}; 

    const event = await getEvent(eventId, user.id); 

    return {
      title: `${event.user.displayName}: ${event.title}`, 
    };
  }

  export default async function Page({ params: { eventId } }: PageProps) {
    const { user } = await validateRequest(); 

    if (!user) {
      return (
        <p className="text-destructive">
          You&apos;re not authorized to view this page.
        </p>
      );
    }

    const event = await getEvent(eventId, user.id); 

    return (
      <main className="flex w-full min-w-0 gap-5">
        <div className="w-full min-w-0 space-y-5">
          <Event event={event} />
        </div>
        <div className="sticky top-[5.25rem] hidden h-fit w-80 flex-none lg:block">
          <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
            <UserInfoSidebar user={event.user} />
          </Suspense>
        </div>
      </main>
    );
  }

  interface UserInfoSidebarProps {
    user: UserData; 
  }

  async function UserInfoSidebar({ user }: UserInfoSidebarProps) {
    const { user: loggedInUser } = await validateRequest(); 

    if (!loggedInUser) return null; 

    return (
      <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
        <div className="text-xl font-bold">About this user</div>
        <UserTooltip user={user}>
          <Link
            href={`/users/${user.username}`}
            className="flex items-center gap-3"
          >
            <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
            <div>
              <p className="line-clamp-1 break-all font-semibold hover:underline">
                {user.displayName}
              </p>
              <p className="line-clamp-1 break-all text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </Link>
        </UserTooltip>
        <Linkify>
          <div className="line-clamp-6 whitespace-pre-line break-words text-muted-foreground">
            {user.bio}
          </div>
        </Linkify>
        {user.id !== loggedInUser.id && (
          <JoinButton
            eventId={user.id}
            initialState={{
              joins: user._count.joins,
              isJoinedByUser: user.joins.some(
                ({ userId }) => userId === loggedInUser.id,
              ),
            }}
          />
        )}
      </div>
    );
  }
