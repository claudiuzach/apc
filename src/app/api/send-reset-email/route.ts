// src/app/api/send-reset-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path as necessary
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  
  // Find the user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ message: "If the email exists, a reset link will be sent." });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Update user with reset token and expiry
  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken: tokenHash,
      tokenExpiry: new Date(Date.now() + 3600000), // 1 hour
    },
  });

  // Construct reset URL
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // Your SMTP host
    port: Number(process.env.EMAIL_PORT), // Your SMTP port
    auth: {
      user: process.env.EMAIL_USER, // Your email user
      pass: process.env.EMAIL_PASS, // Your email password
    },
  });

  try {
    // Send reset email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Sender address
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
    });

    return NextResponse.json({ message: "If the email exists, a reset link will be sent." });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}
