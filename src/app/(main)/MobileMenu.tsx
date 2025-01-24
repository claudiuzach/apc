"use client"; // Indicate that this component is a client component

import { useState, useEffect, useRef } from "react"; // Import useRef and useEffect
import { Button } from "@/components/ui/button";
import { Bookmark, Clipboard, Home, MapPin, Menu } from "lucide-react"; // Import the Menu icon
import Link from "next/link";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";

interface MenuBarProps {
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  isAdmin: boolean;
}

export default function MenuBar({ unreadNotificationsCount, unreadMessagesCount, isAdmin }: MenuBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null); // Create a ref for the menu

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    // Check if the menu is open and if the click was outside the menu
    if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false); // Close the menu
    }
  };

  useEffect(() => {
    // Add event listener for clicks
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Cleanup event listener on component unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="relative">
  {/* Mobile Navigation */}
  <div className="lg:hidden flex flex-col">
    {/* Main buttons */}
    <div className="flex justify-between items-center p-3 bg-gray-100 border-t border-gray-300 gap-8 w-full"> {/* Updated here */}
      <Button variant="ghost" className="flex items-center justify-start gap-3" title="Home" asChild>
        <Link href="/">
          <Home className="w-6 h-6" /> {/* Increased size for Home icon */}
        </Link>
      </Button>
      <NotificationsButton initialState={{ unreadCount: unreadNotificationsCount }} />
      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
       {/* Hamburger Menu Button */}
      <Button variant="ghost" className="flex items-center justify-center w-12 h-12" onClick={toggleMenu} title="Menu">
        <Menu className="w-6 h-6" /> {/* Increased size for Menu icon */}
      </Button>
    </div>

        {/* Slide-up Menu */}
    {isMenuOpen && (
      <div
        ref={menuRef}
        className="flex flex-col absolute bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-300 transition-transform transform translate-y-0 w-full"
      >
        <div className="flex flex-col p-4 space-y-4">
              <Button variant="ghost" className="flex items-center justify-start gap-4 w-full" title="Bookmarks" asChild>
                <Link href="/bookmarks" className="flex items-center justify-start gap-3 w-full">
                  <Bookmark className="w-8 h-8" /> {/* Increased size for Bookmark icon */}
                  <span className="text-left">Bookmarks</span>
                </Link>
              </Button>
              <Button variant="ghost" className="flex items-center justify-start gap-4 w-full" title="Nearby Members" asChild>
                <Link href="/nearbyUsers" className="flex items-center justify-start gap-3 w-full">
                  <MapPin className="w-6 h-6" /> {/* Increased size for MapPin icon */}
                  <span className="text-left">Nearby Members</span>
                </Link>
              </Button>
              <Button variant="ghost" className="flex items-center justify-start gap-4 w-full" title="Events" asChild>
                <Link href="/events" className="flex items-center justify-start gap-3 w-full">
                  <Clipboard className="w-6 h-6" /> {/* Increased size for Clipboard icon */}
                  <span className="text-left">Events</span>
                </Link>
              </Button>
              {/* Add Approvals link for admins */}
              {isAdmin && (
                <Button variant="ghost" className="flex items-center justify-start gap-4 w-full" title="Approvals" asChild>
                  <Link href="/approvals" className="flex items-center justify-start gap-3 w-full">
                    <Clipboard className="w-6 h-6" /> {/* Increased size for Clipboard icon */}
                    <span className="text-left">Approvals</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
