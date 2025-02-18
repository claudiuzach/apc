import { StreamChat } from "stream-chat";
import prisma from "@/lib/prisma";

const client = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_KEY!,
  process.env.STREAM_SECRET!
);

async function cleanUpDeletedUsers() {
  console.log("Running Stream Chat cleanup...");

  // Get users from your database
  const usersInDB = await prisma.user.findMany({ select: { id: true } });
  const dbUserIds = new Set(usersInDB.map((user) => user.id));

  let offset = 0;
  let hasMoreUsers = true;

  while (hasMoreUsers) {
    const streamUsers = await client.queryUsers({}, { id: 1 }, { limit: 50, offset });

    if (streamUsers.users.length === 0) {
      hasMoreUsers = false;
      break;
    }

    for (const user of streamUsers.users) {
      if (!dbUserIds.has(user.id)) {
        console.log(`Deleting user ${user.id} from Stream Chat...`);
        await client.deleteUser(user.id, { hard_delete: true });
      }
    }

    offset += 50;
  }

  console.log("Cleanup complete.");
}

cleanUpDeletedUsers()
  .then(() => console.log("Cleanup finished."))
  .catch((error) => console.error("Error cleaning up Stream users:", error));
