import kyInstance from "@/lib/ky";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    // 🔹 Use the correct API route based on your folder structure
    kyInstance
      .get(`/api/users/check-user-exists?userId=${user.id}`) // ✅ FIXED API PATH
      .json<{ exists: boolean }>()
      .then((data) => {
        if (!data.exists) {
          console.warn(`User ${user.id} no longer exists. Not connecting to Stream Chat.`);
          return;
        }

        return client.connectUser(
          {
            id: user.id,
            username: user.username,
            name: user.displayName,
            image: user.avatarUrl,
          },
          async () =>
            kyInstance
              .get("/api/get-token")
              .json<{ token: string }>()
              .then((data) => data.token)
        );
      })
      .then(() => setChatClient(client))
      .catch((error) => console.error("Failed to connect user", error));

    return () => {
      setChatClient(null);
      client
        .disconnectUser()
        .catch((error) => console.error("Failed to disconnect user", error))
        .then(() => console.log("Connection closed"));
    };
  }, [user.id, user.username, user.displayName, user.avatarUrl]);

  return chatClient;
}
