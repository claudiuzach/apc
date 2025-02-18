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

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser();
      if (currentUser.error || currentUser.role !== UserRole.ADMIN) {
        redirect('/unauthorized');
      }

      const usersData = await fetchUsers();
      const statesData = await fetchStateCounts();
      setStateCounts(statesData);

      const filteredUsers = usersData.filter(user => user.status === UserStatus.PENDING || user.status === UserStatus.REJECTED);
      setUsers(filteredUsers);
      setLoading(false);
    }
    loadData();
  }, []);

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

  if (loading) return <div className="text-center text-lg font-semibold">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Approvals & User Analytics</h1>

      {/* Approvals Table */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">User Approvals</h2>
        <div className="overflow-x-auto bg-card rounded-lg shadow-lg p-4">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id} className="hover:bg-muted">
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{user.state || 'N/A'}</TableCell>
                  <TableCell>
                    <select
                      value={updatedUsers[user.id]?.status || user.status}
                      onChange={e => handleChange(user.id, e.target.value as UserStatus, user.role)}
                      className="border rounded p-1 w-full bg-background text-foreground"
                    >
                      <option value={UserStatus.ACTIVE}>Accept</option>
                      <option value={UserStatus.PENDING}>Pending</option>
                      <option value={UserStatus.REJECTED}>Rejected</option>
                    </select>
                  </TableCell>
                  <TableCell className="capitalize">{user.role.toLowerCase()}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleSaveChanges(user.id)} disabled={savingUser === user.id}>
                      {savingUser === user.id ? <Loader2 className="animate-spin size-4" /> : 'Save'}
                    </Button>
                    <Button variant="destructive" onClick={() => setUserToDelete(user)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Members by State Table */}
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Number of Members by State</h2>
      <div className="overflow-x-auto bg-card rounded-lg shadow-lg p-4">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>State</TableHead>
              <TableHead className="text-right">Total Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stateCounts.map(state => (
              <TableRow key={state.state}>
                <TableCell>{state.state}</TableCell>
                <TableCell className="text-right">{state.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
