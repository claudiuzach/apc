// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the import as necessary


export async function GET() {
  try {
    const stateCounts = await prisma.user.groupBy({
      by: ['state'],
      where: { state: { not: null } }, // Ignore null states
      _count: { state: true },
    });

    return NextResponse.json(
      stateCounts.map((item) => ({
        state: item.state,
        count: item._count.state,
      }))
    );
  } catch (error) {
    console.error('Error fetching state counts:', error);
    return NextResponse.json({ error: 'Failed to fetch state counts' }, { status: 500 });
  }
}
