"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { sendWelcomeEmail } from "@/utils/email";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";

export async function signUp(
  credentials: SignUpValues,
): Promise<{ error?: string }> {
  try {
    const { username, fullName, nin, phoneNumber, memberNumber, email, password, state, signature } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    // Check if username, email, or NIN already exist
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: "insensitive" } },
          { email: { equals: email, mode: "insensitive" } },
          { nin: { equals: nin, mode: "insensitive" } }
        ],
      },
    });

    if (existingUser) {
      return { error: "Username, email, or NIN already exists" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          fullName, // ✅ Store full name
          nin, // ✅ Store NIN
          phoneNumber, // ✅ Store phone number
          memberNumber,
          displayName: username,
          email,
          passwordHash,
          state,
          signature, // ✅ Store signature if provided
          status: "PENDING",
          role: "MEMBER",
          dateRegistered: new Date(), // ✅ Auto-set registration date
        },
      });

      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username,
      });
    });

    await sendWelcomeEmail(email, username);

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return { error: undefined }; 
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}
  