import { useChatContext } from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, LogOut } from "lucide-react"; // LogOut icon for leaving chat
import {
  Channel,
  ChannelHeader,
  ChannelHeaderProps,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";
import { useToast } from "@/components/ui/use-toast";

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
}

export default function ChatChannel({ open, openSidebar }: ChatChannelProps) {
  return (
    <div className={cn("w-full md:block", !open && "hidden")}>
      <Channel>
        <Window>
          <CustomChannelHeader openSidebar={openSidebar} />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}

interface CustomChannelHeaderProps extends ChannelHeaderProps {
  openSidebar: () => void;
}

function CustomChannelHeader({ openSidebar, ...props }: CustomChannelHeaderProps) {
  const { channel, client, setActiveChannel } = useChatContext();
  const { toast } = useToast();

  if (!channel) return <div className="text-gray-500 dark:text-gray-300">No active chat</div>;

  // ✅ Get the correct chat title
  let chatTitle = "Chat";
  const members = Object.values(channel.state.members);

  if (members.length === 2) {
    // If it's a 1-on-1 chat, find the other user
    const otherUser = members.find((member) => member.user?.id !== client.userID);
    chatTitle = otherUser?.user?.name || "Chat";
  } else if (channel.data?.name) {
    // If it's a group chat, use the channel name
    chatTitle = channel.data.name;
  }

  // ✅ Function to Leave Chat
  const handleLeaveConversation = async () => {
    if (!channel || !client.userID) return;

    try {
      await channel.removeMembers([client.userID]); // ✅ Remove the current user
      setActiveChannel(undefined); // Reset active chat
      toast({
        title: "Left Chat",
        description: "You have left the conversation.",
      });
    } catch (error) {
      console.error("Error leaving chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to leave the conversation. Please try again.",
      });
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-white dark:bg-gray-900">
      {/* Left Side: Sidebar Button and Chat Name */}
      <div className="flex items-center gap-3">
        <div className="h-full p-2 md:hidden">
          <Button size="icon" variant="ghost" onClick={openSidebar}>
            <Menu className="size-5 text-gray-900 dark:text-white" />
          </Button>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {chatTitle}
        </h2>
      </div>

      {/* Right Side: Leave Chat Button */}
      <Button
        size="icon"
        variant="destructive"
        onClick={handleLeaveConversation}
        className="ml-auto"
      >
        <LogOut className="size-5 text-gray-900 dark:text-white" />
      </Button>
    </div>
  );
}
