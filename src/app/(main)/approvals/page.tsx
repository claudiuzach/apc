"use client";
export const dynamic = 'force-dynamic'; // ✅ Forces dynamic rendering

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserStatus, UserRole } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import NigeriaMap from "@/components/NigeriaMap";

interface User {
  id: string;
  username: string;
  email: string | null;
  status: UserStatus;
  role: UserRole;
  state: string | null;
}

interface StateCount {
  state: string;
  count: number;
}

// **Force dynamic rendering to prevent static export errors**

export default function ApprovalsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [updatedUsers, setUpdatedUsers] = useState<Record<string, { status: UserStatus; role: UserRole }>>({});
  const [stateCounts, setStateCounts] = useState<StateCount[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  // ✅ Fetch Data Safely
  useEffect(() => {
    async function loadData() {
      try {
        const currentUserResponse = await fetch("/api/get-current-user", { cache: "no-store" });
        if (!currentUserResponse.ok) throw new Error("Failed to fetch current user");
    
        const [usersDataResponse, statesDataResponse] = await Promise.all([
          fetch("/api/users", { cache: "no-store" }),
          fetch("/api/state-counts", { cache: "no-store" }),
        ]);

        if (!usersDataResponse.ok || !statesDataResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const usersData = await usersDataResponse.json();
        const statesData = await statesDataResponse.json();

        setStateCounts(statesData);
        setUsers(usersData.filter((user: User) => user.status === UserStatus.PENDING || user.status === UserStatus.REJECTED));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]); // ✅ Ensure router dependency exists

 // ✅ Handle Status & Role Change
 const handleChange = (userId: string, status: UserStatus, role: UserRole) => {
  setUpdatedUsers((prev) => ({
    ...prev,
    [userId]: { status, role },
  }));
};

const handleSaveChanges = async (userId: string) => {
  if (!updatedUsers[userId]) return;

  setSavingUser(userId);
  const { status, role } = updatedUsers[userId];

  try {
    const response = await fetch(`/api/update-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, status, role }),
    });

    if (response.ok) {
      setUsers((prevUsers) =>
        prevUsers
          .map((user) => (user.id === userId ? { ...user, status, role } : user))
          .filter((user) => user.status !== UserStatus.ACTIVE)
      );

      toast({
        title: `User Updated`,
        description: `User is now ${status.toLowerCase()} and assigned as ${role.toLowerCase()}.`,
      });
    } else {
      throw new Error("Failed to update user");
    }
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to update user. Please try again.",
    });
  } finally {
    setSavingUser(null);
  }
};

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/delete-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        toast({ title: "User Deleted", description: "User has been removed." });
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user. Please try again.",
      });
    }
  };

  if (loading) return <div className="text-center text-lg font-semibold">Loading...</div>;

  return (
    <div className="p-4 max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Approvals & User Analytics</h1>

      {/* ✅ MOBILE VERSION - User Approvals as Cards */}
      <div className="block md:hidden">
        {users.map(user => (
          <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user.username}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Email: {user.email || "N/A"}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">State: {user.state || "N/A"}</p>

            <div className="mt-2">
              <label className="block text-sm font-semibold">Status:</label>
              <select
                value={updatedUsers[user.id]?.status || user.status}
                onChange={e => handleChange(user.id, e.target.value as UserStatus, user.role)}
                className="w-full p-2 border rounded bg-background text-foreground"
              >
                <option value={UserStatus.ACTIVE}>Active</option>
                <option value={UserStatus.PENDING}>Pending</option>
                <option value={UserStatus.REJECTED}>Rejected</option>
              </select>
            </div>

            <div className="mt-2">
            <Button onClick={() => handleSaveChanges(user.id)} disabled={savingUser === user.id}>
                    {savingUser === user.id ? <Loader2 className="animate-spin size-4" /> : "Save"}
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteUser(user.id)} className="ml-2">
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ DESKTOP VERSION - Approvals Table */}
      <div className="hidden md:block overflow-x-auto bg-card rounded-lg shadow-lg p-4">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email || "N/A"}</TableCell>
                <TableCell>{user.state || "N/A"}</TableCell>
                
                <TableCell>
                    <select
                      value={updatedUsers[user.id]?.status || user.status}
                      onChange={e => handleChange(user.id, e.target.value as UserStatus, user.role)}
                      className="border rounded p-1 w-full bg-background text-foreground"
                    >
                      <option value={UserStatus.ACTIVE}>Active Members</option>
                      <option value={UserStatus.PENDING}>Pending</option>
                      <option value={UserStatus.REJECTED}>Rejected</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      value={updatedUsers[user.id]?.role || user.role}
                      onChange={e => handleChange(user.id, user.status, e.target.value as UserRole)}
                      className="border rounded p-1 w-full bg-background text-foreground"
                    >
                      <option value={UserRole.ADMIN}>Admin</option>
                      <option value={UserRole.MEMBER}>Member</option>
                      <option value={UserRole.STATE_MANAGER}>State Manager</option>
                    </select>
                  </TableCell>
                <TableCell className="text-right">
                <Button className='mr-2' onClick={() => handleSaveChanges(user.id)} disabled={savingUser === user.id} >
                {savingUser === user.id ? <Loader2 className="animate-spin size-4" /> : "Save"}
              </Button>                  
              <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Members by State Table */}
<h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white mt-10">Number of Members by State</h2>

{/* ✅ Mobile Version (Card Layout) */}
<div className="block md:hidden mt-5">
  {stateCounts.map((state) => (
    <div key={state.state} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{state.state}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        <span className="font-semibold">Total Members:</span> {state.count}
      </p>
    </div>
  ))}
</div>

{/* ✅ Desktop Version (Table Layout) */}
<div className="hidden md:block overflow-x-auto bg-card rounded-lg shadow-lg p-4">
  <Table className="w-full">
    <TableHeader>
      <TableRow>
        <TableHead>State</TableHead>
        <TableHead className="text-right">Total Members</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {stateCounts.map((state) => (
        <TableRow key={state.state}>
          <TableCell>{state.state}</TableCell>
          <TableCell className="text-right">{state.count}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>


      {/* ✅ Nigeria Map */}
      <div className="overflow-hidden">
        <NigeriaMap stateCounts={stateCounts} />
      </div>
    </div>
  );
}
