"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Clipboard, Home, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Import a helper for handling dark mode

export default function FullMobileMenu({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center space-y-6 p-6">
      {/* Close Button */}
      <Button
        variant="ghost"
        className="absolute top-4 right-4"
        onClick={() => router.back()} // Closes the menu and goes back
      >
        <X className="w-8 h-8 text-gray-800 dark:text-gray-100" />
      </Button>

      {/* Menu Items */}
      <nav className="flex flex-col space-y-6 w-full max-w-md">
        <Link href="/" className={cn("flex items-center gap-4 text-lg font-semibold text-gray-800 dark:text-gray-100")}>
          <Home className="w-8 h-8" />
          Home
        </Link>

        <Link href="/bookmarks" className={cn("flex items-center gap-4 text-lg font-semibold text-gray-800 dark:text-gray-100")}>
          <Bookmark className="w-8 h-8" />
          Bookmarks
        </Link>

        <Link href="/nearbyUsers" className={cn("flex items-center gap-4 text-lg font-semibold text-gray-800 dark:text-gray-100")}>
          <MapPin className="w-8 h-8" />
          Nearby Members
        </Link>

        <Link href="/events" className={cn("flex items-center gap-4 text-lg font-semibold text-gray-800 dark:text-gray-100")}>
          <Clipboard className="w-8 h-8" />
          Events
        </Link>

        {isAdmin && (
          <Link href="/approvals" className={cn("flex items-center gap-4 text-lg font-semibold text-gray-800 dark:text-gray-100")}>
            <Clipboard className="w-8 h-8" />
            Approvals
          </Link>
        )}
      </nav>
    </div>
  );
}
