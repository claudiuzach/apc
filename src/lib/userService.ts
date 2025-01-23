// userService.ts
import { PrismaClient } from "@prisma/client";
import { UserData } from "@/lib/types"; // Ensure this is correct

const prisma = new PrismaClient();

// Function to calculate the distance (same as before)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
}

// Function to get users within a specific radius
export async function getUsersWithinRadius(latitude: number, longitude: number, radius: number): Promise<UserData[]> {
  // Fetch users with required fields from the database
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true, // Add these fields
      createdAt: true, // Add these fields
      latitude: true,
      longitude: true,
      followers: {
        select: {
          followerId: true,
        },
      },
      _count: {
        select: {
          posts: true,
          followers: true,
        },
      },
    },
  });

  // Filter users by calculating distance
  return allUsers.filter(user => {
    if (user.latitude === null || user.longitude === null) return false; // Skip if coordinates are null
    const distance = calculateDistance(latitude, longitude, user.latitude, user.longitude);
    return distance <= radius;  // Return users within the specified radius
  }) as UserData[]; // Type assertion to ensure returned data matches UserData type
}
