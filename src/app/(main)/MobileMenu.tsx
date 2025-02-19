"use client";
import { usePathname } from "next/navigation";
import { Home, Menu, MessageCircle, Bell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";

interface MenuBarProps {
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  isAdmin: boolean;
}

export default function MenuBar({ unreadNotificationsCount, unreadMessagesCount, isAdmin }: MenuBarProps) {
  const pathname = usePathname(); // Detect active route

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-xl rounded-t-3xl p-4 flex justify-around items-center">
      {/* Home */}
      <Link href="/" className="relative flex flex-col items-center group">
        <div
          className={cn(
            "w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300",
            pathname === "/" ? "bg-green-500 text-white shadow-lg -translate-y-3" : "text-gray-500 dark:text-gray-400"
          )}
        >
          <Home className="w-6 h-6" />
        </div>
        <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Home</span>
      </Link>

      {/* Notifications */}
      <div className="relative flex flex-col items-center">
        <NotificationsButton initialState={{ unreadCount: unreadNotificationsCount }} />
        <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Notifications</span>
      </div>

      {/* Messages */}
      <div className="relative flex flex-col items-center">
        <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
        <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Messages</span>
      </div>

      {/* Full Menu */}
      <button
        className="relative flex flex-col items-center"
        onClick={() => {
          if (isAdmin) {
            window.location.href = "/full-mobile-menu-admin";
          } else {
            window.location.href = "/full-mobile-menu";
          }
        }}
      >
        <div
          className={cn(
            "w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300",
            pathname.includes("full-mobile-menu") ? "bg-green-500 text-white shadow-lg -translate-y-3" : "text-gray-500 dark:text-gray-400"
          )}
        >
          <Menu className="w-6 h-6" />
        </div>
        <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Menu</span>
      </button>
    </div>
  );
}
