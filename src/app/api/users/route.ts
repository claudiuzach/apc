// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the import as necessary

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        role: true,
        state:true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.error(); // Return an error response if fetching fails
  }
}
