'use client';
import { useEffect, useState } from 'react';
import { UserStatus, UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import NigeriaMap from '@/components/NigeriaMap';
import dynamic from 'next/dynamic';

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

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

async function getCurrentUser() {
  const response = await fetch('/api/get-current-user');
  return response.json();
}

async function fetchStateCounts(): Promise<StateCount[]> {
  const response = await fetch('/api/state-counts');
  if (!response.ok) throw new Error('Failed to fetch state counts');
  return response.json();
}

async function deleteUser(userId: string) {
  const response = await fetch('/api/delete-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) throw new Error('Failed to delete user');
}

export default function ApprovalsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [updatedUsers, setUpdatedUsers] = useState<{ [key: string]: { status: UserStatus; role: UserRole } }>({});
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();
  const [stateCounts, setStateCounts] = useState<StateCount[]>([]);
  const [mounted, setMounted] = useState(false);

// ✅ Disable SSR for the entire map
const DynamicNigeriaMap = dynamic(() => import("@/components/NigeriaMap"), {
  ssr: false,
});

   useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function loadData() {
      try {
        const currentUserResponse = await fetch('/api/get-current-user');
        if (!currentUserResponse.ok) throw new Error('Failed to fetch user');
        const currentUser = await currentUserResponse.json();

        if (currentUser.error || currentUser.role !== UserRole.ADMIN) {
          redirect('/unauthorized');
        }

        const [usersDataResponse, statesDataResponse] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/state-counts'),
        ]);

        if (!usersDataResponse.ok || !statesDataResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const usersData = await usersDataResponse.json();
        const statesData = await statesDataResponse.json();

        setStateCounts(statesData);
        setUsers(usersData.filter((user: User) => user.status === UserStatus.PENDING || user.status === UserStatus.REJECTED));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [mounted]);

  const handleChange = (userId: string, status: UserStatus, role: UserRole) => {
    setUpdatedUsers(prev => ({
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, status, role }),
      });

      if (response.ok) {
        setUsers(prevUsers =>
          prevUsers
            .map(user => (user.id === userId ? { ...user, status, role } : user))
            .filter(user => user.status !== UserStatus.ACTIVE)
        );

        toast({
          title: `User ${status}`,
          description: `The user has been successfully ${status.toLowerCase()}.`,
        });
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user. Please try again.',
      });
    } finally {
      setSavingUser(null);
    }
  };

  if (!mounted || loading) {
    return <p className="text-center text-lg font-semibold">Loading...</p>;
  }
  return (
    <div className="p-4 max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Approvals & User Analytics</h1>

      {/* ✅ MOBILE VERSION - User Approvals as Cards */}
      <div className="block md:hidden">
        {users?.length > 0 ? users.map(user => (
          <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user.username}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Email: {user.email || "N/A"}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">State: {user.state || "N/A"}</p>

            <div className="mt-2">
              <label className="block text-sm font-semibold">Status:</label>
              <select
value={updatedUsers[user.id]?.status || user.status || UserStatus.PENDING}
onChange={e => handleChange(user.id, e.target.value as UserStatus, user.role)}
                className="w-full p-2 border rounded bg-background text-foreground"
              >
                <option value={UserStatus.ACTIVE}>Active</option>
                <option value={UserStatus.PENDING}>Pending</option>
                <option value={UserStatus.REJECTED}>Rejected</option>
              </select>
            </div>

            <div className="mt-2">
              <Button onClick={() => handleSaveChanges(user.id)} disabled={savingUser === user.id} className="w-full">
                {savingUser === user.id ? <Loader2 className="animate-spin size-4" /> : "Save"}
              </Button>
              <Button variant="destructive" onClick={() => setUserToDelete(user)} className="w-full mt-2">
                Delete
              </Button>
            </div>
          </div>
        )):<p className='text-center'> No users found</p>}
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
value={updatedUsers[user.id]?.status || user.status || UserStatus.PENDING}
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
                      value={updatedUsers[user.id]?.role || user.role || UserRole.MEMBER}
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
              <Button variant="destructive" onClick={() => setUserToDelete(user)}>Delete</Button>
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
        <DynamicNigeriaMap  stateCounts={stateCounts} />
      </div>
    </div>
  );
}