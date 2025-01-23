"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

async function resetPassword(token: string, newPassword: string) {
  const response = await fetch("/api/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    try {
      const data = await response.json();
      return { error: data.error || "Something went wrong." };
    } catch (err) {
      return { error: "Failed to parse server response." };
    }
  }

  return { success: true };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Extract token from the URL when component mounts
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!token) {
      setError("Token is required.");
      return;
    }

    const result = await resetPassword(token, newPassword);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      router.push("/login");
    }
  };

  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <h1 className="text-center text-3xl font-bold">
            Choose a New Password
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            Enter a new password for your APC account.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Reset Password
            </button>
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            {success && (
              <p className="text-center text-sm text-green-500">
                Password reset successfully! Redirecting...
              </p>
            )}
          </form>
        </div>
        <div className="hidden w-1/2 bg-cover md:block" style={{ backgroundImage: "url('/assets/login-image.jpg/')" }} />
      </div>
    </main>
  );
}
