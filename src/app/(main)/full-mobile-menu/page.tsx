"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark, Clipboard, Home, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FullMobileMenu() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center space-y-6 p-6">
      {/* Close Button */}
      <Button variant="ghost" className="absolute top-4 right-4" onClick={() => router.back()}>
        <X className="w-8 h-8 text-gray-800 dark:text-gray-100" />
      </Button>

      {/* Menu Items */}
      <nav className="flex flex-col space-y-6 w-full max-w-md">
        <Link href="/" className="flex items-center gap-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
          <Home className="w-8 h-8" />
          Home
        </Link>

        <Link href="/bookmarks" className="flex items-center gap-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
          <Bookmark className="w-8 h-8" />
          Bookmarks
        </Link>

        <Link href="/nearbyUsers" className="flex items-center gap-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
          <MapPin className="w-8 h-8" />
          Nearby Members
        </Link>

        <Link href="/events" className="flex items-center gap-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
          <Clipboard className="w-8 h-8" />
          Events
        </Link>

        <Link href="/certificates" className="flex items-center gap-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
          <Clipboard className="w-8 h-8" />
          Membership
        </Link>
      </nav>
    </div>
  );
}
