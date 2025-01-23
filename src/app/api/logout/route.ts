import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete("auth_session"); // Replace with your cookie name
  return NextResponse.json({ message: "Logged out successfully" });
}
