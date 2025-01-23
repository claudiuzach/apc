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

// Define the User type
interface User {
  id: string;
  username: string;
  email: string | null;
  status: UserStatus;
  role: UserRole;
}

// Fetch users from the new API route
async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to fetch users: ${response.status} - ${errorMessage}`);
  }

  return response.json();
}

// Fetch the current user's role
async function getCurrentUser() {
  const response = await fetch('/api/get-current-user');
  return response.json();
}

// Delete a user
async function deleteUser(userId: string) {
  const response = await fetch('/api/delete-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to delete user: ${error.error}`);
  }
}

export default function ApprovalsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedUsers, setUpdatedUsers] = useState<{
    [key: string]: { status: UserStatus; role: UserRole };
  }>({});
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser();

      if (currentUser.error || currentUser.role !== UserRole.ADMIN) {
        redirect('/unauthorized');
      }

      setCurrentUserId(currentUser.id);

      const usersData = await fetchUsers();
      const filteredUsers = usersData.filter(user => user.id !== currentUser.id);
      setUsers(filteredUsers);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleChange = (userId: string, status: UserStatus, role: UserRole) => {
    setUpdatedUsers((prev) => ({
      ...prev,
      [userId]: { status, role },
    }));
  };

  const handleSaveChanges = async (userId: string) => {
    const { status, role } = updatedUsers[userId];

    const response = await fetch(`/api/update-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, status, role }),
    });

    if (response.ok) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status, role } : user
        )
      );
      setUpdatedUsers((prev) => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });
    } else {
      console.error('Failed to update user');
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete.id));
      setUserToDelete(null);

      toast({
        title: 'User Deleted',
        description: `The user "${userToDelete.username}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Approvals</h1>

      {/* Mobile Card Layout */}
      <div className="block md:hidden">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-4 rounded-lg shadow mb-4">
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p>Email: {user.email}</p>
            <p>Status: 
              <select
                value={updatedUsers[user.id]?.status || user.status}
                onChange={(e) =>
                  handleChange(user.id, e.target.value as UserStatus, user.role)
                }
                className="border rounded p-1 w-full mt-1"
              >
                <option value={UserStatus.ACTIVE}>Active</option>
                <option value={UserStatus.PENDING}>Pending</option>
                <option value={UserStatus.REJECTED}>Rejected</option>
              </select>
            </p>
            <p>Role: 
              <select
                value={updatedUsers[user.id]?.role || user.role}
                onChange={(e) =>
                  handleChange(user.id, user.status, e.target.value as UserRole)
                }
                className="border rounded p-1 w-full mt-1"
              >
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.MEMBER}>Member</option>
                <option value={UserRole.STATE_MANAGER}>State Manager</option>
              </select>
            </p>
            <div className="flex space-x-2 mt-4">
              <Button
                onClick={() => handleSaveChanges(user.id)}
                className="bg-blue-600 text-white"
              >
                Save
              </Button>
              <Button
                variant="destructive"
                onClick={() => setUserToDelete(user)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableCaption>A list of user approvals.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Username</TableHead>
              <TableHead className="w-[150px]">Email</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[150px]">Role</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-100">
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <select
                    value={updatedUsers[user.id]?.status || user.status}
                    onChange={(e) =>
                      handleChange(user.id, e.target.value as UserStatus, user.role)
                    }
                    className="border rounded p-1 w-full"
                  >
                    <option value={UserStatus.ACTIVE}>Active</option>
                    <option value={UserStatus.PENDING}>Pending</option>
                    <option value={UserStatus.REJECTED}>Rejected</option>
                  </select>
                </TableCell>
                <TableCell>
                  <select
                    value={updatedUsers[user.id]?.role || user.role}
                    onChange={(e) =>
                      handleChange(user.id, user.status, e.target.value as UserRole)
                    }
                    className="border rounded p-1 w-full"
                  >
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.MEMBER}>Member</option>
                    <option value={UserRole.STATE_MANAGER}>State Manager</option>
                  </select>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2">
                    <Button onClick={() => handleSaveChanges(user.id)}>Save</Button>
                    <Button variant="destructive" onClick={() => setUserToDelete(user)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ShadCN Dialog for Deletion Confirmation */}
      <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the user{' '}
            <span className="font-bold">{userToDelete?.username}</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUserToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
