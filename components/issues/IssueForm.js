"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ISSUE_PRIORITY, ISSUE_PRIORITY_VALUES } from "@/config/constants";
import { PRIORITY_LABELS } from "@/utils/chartColors";
import AttachmentPicker from "./AttachmentPicker";
import { uploadAttachments } from "@/utils/uploadAttachments";

const inputClass =
  "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function IssueForm({ projects }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      project: projects[0]?._id || "",
      module: "",
      title: "",
      description: "",
      priority: ISSUE_PRIORITY.MEDIUM,
      expectedResult: "",
      actualResult: "",
      browser: "",
      operatingSystem: "",
      appVersion: "",
    },
  });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const { data } = await axios.post("/api/issues", values);
      const issueId = data.issue._id;

      if (files.length > 0) {
        setUploading(true);
        try {
          await uploadAttachments(files, issueId);
        } catch (uploadErr) {
          // The issue itself was created successfully — don't lose the
          // report over an attachment hiccup, just surface it and move on.
          console.error("Attachment upload failed:", uploadErr);
          toast.error("Issue created, but attachments failed to upload");
        } finally {
          setUploading(false);
        }
      }

      toast.success("Issue reported");
      router.push(`/issues/${issueId}`);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to create issue";
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Project *</label>
          <select
            {...register("project", { required: true })}
            className={inputClass}
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Module (optional)</label>
          <input
            {...register("module")}
            placeholder="e.g. Checkout, Login"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Title *</label>
        <input
          {...register("title", { required: "Title is required" })}
          placeholder="Short summary of the bug"
          className={inputClass}
        />
        {errors.title && (
          <span className="text-xs text-red-600">{errors.title.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Description *</label>
        <textarea
          {...register("description", {
            required: "Description is required",
          })}
          rows={4}
          placeholder="What happened? Steps to reproduce help a lot."
          className={inputClass}
        />
        {errors.description && (
          <span className="text-xs text-red-600">
            {errors.description.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Priority *</label>
        <select
          {...register("priority", { required: true })}
          className={`${inputClass} sm:w-48`}
        >
          {ISSUE_PRIORITY_VALUES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Expected Result (optional)</label>
          <textarea {...register("expectedResult")} rows={3} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Actual Result (optional)</label>
          <textarea {...register("actualResult")} rows={3} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Browser (optional)</label>
          <input
            {...register("browser")}
            placeholder="Chrome 126"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Operating System (optional)</label>
          <input
            {...register("operatingSystem")}
            placeholder="Windows 11"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>App Version (optional)</label>
          <input
            {...register("appVersion")}
            placeholder="v2.4.1"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Attachments (optional)</label>
        <AttachmentPicker files={files} onChange={setFiles} />
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50"
        >
          {(isSubmitting || uploading) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {uploading ? "Uploading attachments..." : "Submit Issue"}
        </button>
      </div>
    </form>
  );
}
