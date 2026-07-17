"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Search, Trash2 } from "lucide-react";
import AddUserForm from "./AddUserForm";
import { ROLES, USER_STATUS } from "@/config/constants";

export default function UsersTable({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  const patchUser = async (id, updates) => {
    setPendingId(id);
    try {
      const { data } = await axios.patch(`/api/users/${id}`, updates);
      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
      toast.success("User updated");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setPendingId(null);
    }
  };

  const removeUser = async (id) => {
    if (!confirm("Remove this user? They will immediately lose access.")) {
      return;
    }
    setPendingId(id);
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User removed");
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <AddUserForm onCreated={(user) => setUsers((prev) => [user, ...prev])} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900 text-left text-xs uppercase text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Login</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filtered.map((u) => (
              <tr key={u._id} className="text-zinc-800 dark:text-zinc-200">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {u.image ? (
                      <Image
                        src={u.image}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium">
                        {(u.name || u.email)[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{u.name || "—"}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={pendingId === u._id}
                    onChange={(e) => patchUser(u._id, { role: e.target.value })}
                    className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
                  >
                    <option value={ROLES.ADMIN}>Admin</option>
                    <option value={ROLES.DEVELOPER}>Developer</option>
                    <option value={ROLES.REPORTER}>Reporter</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={pendingId === u._id}
                    onClick={() =>
                      patchUser(u._id, {
                        status:
                          u.status === USER_STATUS.ACTIVE
                            ? USER_STATUS.INACTIVE
                            : USER_STATUS.ACTIVE,
                      })
                    }
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.status === USER_STATUS.ACTIVE
                        ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {u.status === USER_STATUS.ACTIVE ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                  {u.lastLogin
                    ? formatDistanceToNow(new Date(u.lastLogin), {
                        addSuffix: true,
                      })
                    : "Never"}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={pendingId === u._id}
                    onClick={() => removeUser(u._id)}
                    className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
