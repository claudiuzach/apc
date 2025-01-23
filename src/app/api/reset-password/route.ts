import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from '@node-rs/argon2';
import crypto from 'crypto'; // Import crypto for hashing

export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json();

  try {
    // Hash the incoming token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Check if the user exists with the provided reset token
    const user = await prisma.user.findFirst({
      where: { passwordResetToken: tokenHash }, // Check against the hashed token
    });

    // If the user does not exist or the token is invalid, return an error
    if (!user || !user.tokenExpiry || user.tokenExpiry < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
    }

    // Hash the new password
    const passwordHash = await hash(newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Update the user's password and clear the reset token and expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null, // Clear the reset token
        tokenExpiry: null, // Clear the token expiry
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
