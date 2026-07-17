"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { ROLES } from "@/config/constants";

export default function AddUserForm({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "", role: ROLES.REPORTER } });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const { data } = await axios.post("/api/users", values);
      onCreated(data.user);
      reset();
      setOpen(false);
      toast.success(`${values.email} added — inactive until you activate them`);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to add user";
      setServerError(message);
      toast.error(message);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Add authorized email
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col sm:flex-row gap-3 items-start sm:items-end rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900/50"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Email
        </label>
        <input
          type="email"
          placeholder="name@fix4ever.com"
          {...register("email", { required: "Email is required" })}
          className="w-64 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100"
        />
        {errors.email && (
          <span className="text-xs text-red-600">{errors.email.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Role
        </label>
        <select
          {...register("role")}
          className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100"
        >
          <option value={ROLES.REPORTER}>Reporter</option>
          <option value={ROLES.DEVELOPER}>Developer</option>
          <option value={ROLES.ADMIN}>Admin</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-900 dark:bg-white px-4 py-1.5 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Add
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
        >
          Cancel
        </button>
      </div>

      {serverError && (
        <span className="text-xs text-red-600 sm:ml-2">{serverError}</span>
      )}
    </form>
  );
}
