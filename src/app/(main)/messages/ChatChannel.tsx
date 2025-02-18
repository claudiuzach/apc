import { useChatContext } from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, Trash2 } from "lucide-react";
import {
  Channel,
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

interface CustomChannelHeaderProps {
  openSidebar: () => void;
}

function CustomChannelHeader({ openSidebar }: CustomChannelHeaderProps) {
  const { channel, setActiveChannel } = useChatContext();
  const { toast } = useToast();

  if (!channel) return <div>No active chat</div>;

  const handleDeleteConversation = async () => {
    try {
      await channel.delete(); // Deletes conversation from Stream
      setActiveChannel(undefined); // Reset active channel
      toast({
        title: "Chat Deleted",
        description: "The conversation was removed successfully.",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
      });
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
      {/* Left Side: Sidebar Button and Chat Name */}
      <div className="flex items-center gap-3">
        <div className="h-full p-2 md:hidden">
          <Button size="icon" variant="ghost" onClick={openSidebar}>
            <Menu className="size-5" />
          </Button>
        </div>
        <h2 className="text-lg font-semibold">{channel?.data?.name || "Chat"}</h2>
      </div>

      {/* Right Side: Delete Chat Button */}
      <Button
        size="icon"
        variant="destructive"
        onClick={handleDeleteConversation}
        className="ml-auto"
      >
        <Trash2 className="size-5" />
      </Button>
    </div>
  );
}
