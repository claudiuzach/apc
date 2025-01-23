// src/app/api/nearbyusers/route.ts
import { NextResponse } from 'next/server';
import { getUsersWithinRadius } from '@/lib/userService'; // Ensure this import path is correct

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const radius = searchParams.get('radius');

  // Validate parameters
  if (!latitude || !longitude || !radius) {
    return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
  }

  try {
    // Convert query parameters to appropriate types
    const nearbyUsers = await getUsersWithinRadius(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(radius)
    );

    return NextResponse.json(nearbyUsers);
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
