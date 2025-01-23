// pages/api/nearby-users.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUsersWithinRadius } from '@/lib/userService'; // Adjust the path accordingly

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { latitude, longitude, radius } = req.query;

  // Check if the parameters are present
  if (!latitude || !longitude || !radius) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  try {
    const nearbyUsers = await getUsersWithinRadius(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      parseInt(radius as string)
    );

    res.status(200).json(nearbyUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
