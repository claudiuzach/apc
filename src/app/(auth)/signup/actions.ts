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
    const { username, memberNumber, email, password, state } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    // Check for existing users
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return {
        error: "Username already taken",
      };
    }

    const existingMemberNumber = await prisma.user.findFirst({
      where: {
        memberNumber: {
          equals: memberNumber,
          mode: "insensitive",
        },
      },
    });

    if (existingMemberNumber) {
      return {
        error: "Member already exists",
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return {
        error: "Email already taken",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          memberNumber,
          displayName: username,
          email,
          passwordHash,
          state,
          status: "PENDING",
          role: "MEMBER",
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

    return { error: undefined }; // Ensure no redirection here
  } catch (error) {
    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
