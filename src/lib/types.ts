import { Prisma } from "@prisma/client";

export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    bio: true,
    createdAt: true,
    status: true, // Add the status field
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    joins: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
        eventId: true,
      },
    },
    _count: {
      select: {
        posts: true,
        followers: true,
        joins: true, // Include joins count here
      },
    },
  } satisfies Prisma.UserSelect;
}


// Update UserData to reflect the correct structure
export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}> & {
  joins: { userId: string; eventId: string }[]; // Ensure joins is included in UserData
};

export function getEventDataInclude(loggedInUserId: string) {
  return {
    // Include event creator details
    user: {
      select: getUserDataSelect(loggedInUserId), // Select user details including joins
    },
    // Include attendees and their details
    attendees: {
      include: {
        user: {
          select: getUserDataSelect(loggedInUserId), // Include detailed user info for each attendee
        },
      },
    },
    // Include attachments for the event
    attachments: {
      select: {
        id: true,
        type: true,
        url: true,
      },
    },
    // Include bookmarks to determine if the logged-in user has bookmarked the event
    bookmarks: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    // Include join information to see if the logged-in user has joined the event
    joins: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
        eventId: true,
      },
    },
    // Include counts for attendees, bookmarks, and joins
    _count: {
      select: {
        attendees: true, // Count of attendees
        bookmarks: true, // Count of bookmarks
        joins: true, // Count of joins
      },
    },
  } satisfies Prisma.EventInclude;
}

export type EventData = Prisma.EventGetPayload<{
  include: ReturnType<typeof getEventDataInclude>;
}> & {
  joins: { userId: string; eventId: string }[]; // Ensure joins is included in EventData
};


export interface JoinInfo {
  joins: number;        // Total number of users who joined the event
  isJoinedByUser: boolean; // Whether the current user has joined the event
}

export interface EventsPage {
  events: EventData[];
  nextCursor: string | null;
}

export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    attachments: true,
    likes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    bookmarks: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
  } satisfies Prisma.PostInclude;
}

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}

export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
  } satisfies Prisma.CommentInclude;
}

export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentsPage {
  comments: CommentData[];
  previousCursor: string | null;
}

export const notificationsInclude = {
  issuer: {
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  post: {
    select: {
      content: true,
    },
  },
} satisfies Prisma.NotificationInclude;

export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude;
}>;

export interface NotificationsPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}

export interface LikeInfo {
  likes: number;
  isLikedByUser: boolean;
}

export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}
export interface JoinInfo {
  joins: number;        // Total number of users who joined the event
  isJoinedByUser: boolean; // Whether the current user has joined the event
}
export interface NotificationCountInfo {
  unreadCount: number;
}

export interface MessageCountInfo {
  unreadCount: number;
}

// lib/types.ts
export interface User {
  id: string; // Unique identifier for the user
  username: string; // Username of the user
  displayName: string; // Display name of the user
  avatarUrl: string | null; // URL of the user's avatar
  latitude: number | null; // User's latitude
  longitude: number | null; // User's longitude
  status: "ACTIVE" | "PENDING" | "REJECTED"; // Include status in the user type
   // ✅ Add New Fields
   fullName: string; 
   nin: string;
   phoneNumber: string;
   signature?: string; // Optional field
   dateRegistered: string; // Store as a Date string

}


export interface Media {
  id: string;         // Unique identifier for the media
  type: "IMAGE" | "VIDEO"; // Type of media
  url: string;       // URL to the media
}

