// src/app/(auth)/forgot-password/actions.ts
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function sendResetEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: "If the email exists, a reset link will be sent." };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken: tokenHash,
      tokenExpiry: new Date(Date.now() + 3600000), // 1 hour
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

  // Send email using the API route
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>Hi,</p>
        <p>You requested a password reset for your APC account. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link is valid for 1 hour.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <p>Best,<br>The APC Team</p>
      `,
    }),
  });

  if (!response.ok) {
    return { error: 'Failed to send email.' };
  }

  return { message: "If the email exists, a reset link will be sent." };
}
