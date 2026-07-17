"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Archive, ArchiveRestore, FolderKanban, Pencil, Check, X } from "lucide-react";
import { ROLES } from "@/config/constants";
import AddProjectForm from "./AddProjectForm";

export default function ProjectsList({ initialProjects }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === ROLES.ADMIN;

  const [projects, setProjects] = useState(initialProjects);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [pendingId, setPendingId] = useState(null);

  const startEdit = (project) => {
    setEditingId(project._id);
    setEditName(project.name);
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    setPendingId(id);
    try {
      const { data } = await axios.patch(`/api/projects/${id}`, {
        name: editName,
      });
      setProjects((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...data.project } : p))
      );
      setEditingId(null);
      toast.success("Project updated");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update project");
    } finally {
      setPendingId(null);
    }
  };

  const toggleArchive = async (project) => {
    setPendingId(project._id);
    try {
      const { data } = await axios.patch(`/api/projects/${project._id}`, {
        isArchived: !project.isArchived,
      });
      setProjects((prev) =>
        prev.map((p) => (p._id === project._id ? { ...p, ...data.project } : p))
      );
      toast.success(
        data.project.isArchived ? "Project archived" : "Project restored"
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update project");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex justify-end">
          <AddProjectForm
            onCreated={(project) =>
              setProjects((prev) => [...prev, { ...project, issueCount: 0 }])
            }
          />
        </div>
      )}

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-16 text-center">
          <FolderKanban className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No projects yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className={`rounded-xl border p-4 flex flex-col gap-3 ${
                project.isArchived
                  ? "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 opacity-60"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                {editingId === project._id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100"
                    autoFocus
                  />
                ) : (
                  <Link
                    href={`/issues?project=${project._id}`}
                    className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline"
                  >
                    {project.name}
                  </Link>
                )}

                {isAdmin && editingId !== project._id && (
                  <button
                    type="button"
                    onClick={() => startEdit(project)}
                    className="shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {project.description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {project.issueCount} issue{project.issueCount !== 1 ? "s" : ""}
                </span>

                {isAdmin &&
                  (editingId === project._id ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={pendingId === project._id}
                        onClick={() => saveEdit(project._id)}
                        className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 text-xs text-zinc-400"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={pendingId === project._id}
                      onClick={() => toggleArchive(project)}
                      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      {project.isArchived ? (
                        <>
                          <ArchiveRestore className="h-3.5 w-3.5" /> Restore
                        </>
                      ) : (
                        <>
                          <Archive className="h-3.5 w-3.5" /> Archive
                        </>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
