import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { Bookmark, Clipboard, Home, MapPin } from "lucide-react"; // Import the MapPin icon
import Link from "next/link";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"; // Assuming Carousel is imported from ShadCN

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();

  if (!user) return null;

  const [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    }),
    (await streamServerClient.getUnreadCount(user.id)).total_unread_count,
  ]);

  return (
    <div className={className}>
      {/* Mobile Carousel (only for small screens) */}
      <div className="lg:hidden">
        <Carousel>
          <CarouselContent className="gap-0"> {/* Removed gap for tighter spacing */}
            <CarouselItem className="basis-1/4"> {/* Adjusted to show 4 items */}
              <Button
                variant="ghost"
                className="flex items-center justify-start gap-3"
                title="Home"
                asChild
              >
                <Link href="/">
                  <Home />
                  <span className="hidden lg:inline">Home</span>
                </Link>
              </Button>
            </CarouselItem>
            <CarouselItem className="basis-1/4"> {/* Adjusted to show 4 items */}
              <NotificationsButton
                initialState={{ unreadCount: unreadNotificationsCount }}
              />
            </CarouselItem>
            <CarouselItem className="basis-1/4"> {/* Adjusted to show 4 items */}
              <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
            </CarouselItem>
            <CarouselItem className="basis-1/4"> {/* Adjusted to show 4 items */}
              <Button
                variant="ghost"
                className="flex items-center justify-start gap-3"
                title="Bookmarks"
                asChild
              >
                <Link href="/bookmarks">
                  <Bookmark />
                  <span className="hidden lg:inline">Bookmarks</span>
                </Link>
              </Button>
            </CarouselItem>
            <CarouselItem className="basis-1/4"> {/* Adjusted to show 4 items */}
              <Button
                variant="ghost"
                className="flex items-center justify-start gap-3"
                title="Nearby Members"
                asChild
              >
                <Link href="/nearbyUsers">
                  <MapPin />
                  <span className="hidden lg:inline">Nearby Members</span>
                </Link>
              </Button>
            </CarouselItem>
            <CarouselItem className="basis-1/4"> {/* Adjusted to show 4 items */}
              <Button
                variant="ghost"
                className="flex items-center justify-start gap-3"
                title="Events"
                asChild
              >
                <Link href="/events">
                  <Clipboard />
                  <span className="hidden lg:inline">Events</span>
                </Link>
              </Button>
            </CarouselItem>
            {/* Add Approvals link for admins */}
            {user.role === "ADMIN" && ( // Adjust according to your UserRole enum value
              <CarouselItem className="basis-1/4"> {/* Adjusted to show 4 items */}
                <Button
                  variant="ghost"
                  className="flex items-center justify-start gap-3"
                  title="Approvals"
                  asChild
                >
                  <Link href="/approvals">
                    <Clipboard />
                    <span className="hidden lg:inline">Approvals</span>
                  </Link>
                </Button>
              </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Desktop version (unchanged vertical layout) */}
      <div className="hidden lg:flex flex-col gap-4">
        <Button
          variant="ghost"
          className="flex items-center justify-start gap-3"
          title="Home"
          asChild
        >
          <Link href="/">
            <Home />
            <span className="hidden lg:inline">Home</span>
          </Link>
        </Button>
        <NotificationsButton
          initialState={{ unreadCount: unreadNotificationsCount }}
        />
        <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
        <Button
          variant="ghost"
          className="flex items-center justify-start gap-3"
          title="Bookmarks"
          asChild
        >
          <Link href="/bookmarks">
            <Bookmark />
            <span className="hidden lg:inline">Bookmarks</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center justify-start gap-3"
          title="Nearby Members"
          asChild
        >
          <Link href="/nearbyUsers">
            <MapPin />
            <span className="hidden lg:inline">Nearby Members</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center justify-start gap-3"
          title="Events"
          asChild
        >
          <Link href="/events">
            <Clipboard />
            <span className="hidden lg:inline">Events</span>
          </Link>
        </Button>

        {/* Add Approvals link for admins */}
        {user.role === "ADMIN" && ( // Adjust according to your UserRole enum value
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-3"
            title="Approvals"
            asChild
          >
            <Link href="/approvals">
              <Clipboard />
              <span className="hidden lg:inline">Approvals</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
