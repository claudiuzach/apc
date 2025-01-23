// src/app/(auth)/layout.tsx

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma"; // Assuming you have prisma set up
import { UserStatus } from "@prisma/client"; // Import your enum from Prisma types
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Import the updated alert component

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  if (user) {
    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: { status: true },
    });

    if (account?.status === UserStatus.ACTIVE) {
      redirect("/"); // Redirect to home if account is active
    } else if (account?.status === UserStatus.PENDING) {
      // Render the alert for PENDING users
      return (
        <>
          <Alert className="mt-4 mx-4" autoHideDuration={20000}>
            <AlertTitle>Account Verification</AlertTitle>
            <AlertDescription>
              Your account is under verification. Please check back later.
            </AlertDescription>
          </Alert>
          {children}
        </>
      );
    }
  }

  return <>{children}</>;
}
