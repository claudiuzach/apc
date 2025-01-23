// app/reset-password/actions.ts
import prisma from "@/lib/prisma";
import { hash } from "argon2"; // Change here

export async function resetPassword(token: string, newPassword: string) {
  try {
    // Find the user with the provided reset token
    const user = await prisma.user.findFirst({
      where: { passwordResetToken: token },
    });

    // Check if the user exists and if the token is valid
    if (!user) {
      return { error: "Invalid or expired token." };
    }

    // Check if the token has expired
    const currentDateTime = new Date();
    if (!user.tokenExpiry || user.tokenExpiry < currentDateTime) {
      return { error: "Invalid or expired token." };
    }

    // Hash the new password
    const passwordHash = await hash(newPassword); // Change here

    // Update the user's password and clear the reset token and expiry
    await prisma.user.update({
      where: { id: user.id }, // Use user ID to find the user
      data: {
        passwordHash,
        passwordResetToken: null, // Clear the reset token
        tokenExpiry: null, // Clear the token expiry
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
