"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, FileText, Film, Image as ImageIcon } from "lucide-react";
import { ALLOWED_ATTACHMENT_TYPES, MAX_UPLOAD_SIZE_MB } from "@/config/constants";

function iconFor(file) {
  if (file.type.startsWith("image/")) return ImageIcon;
  if (file.type.startsWith("video/")) return Film;
  return FileText;
}

export default function AttachmentPicker({ files, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const addFiles = useCallback(
    (fileList) => {
      setError("");
      const incoming = Array.from(fileList);
      const valid = [];
      for (const file of incoming) {
        if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
          setError(`${file.name}: unsupported file type`);
          continue;
        }
        if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
          setError(`${file.name}: exceeds ${MAX_UPLOAD_SIZE_MB}MB limit`);
          continue;
        }
        valid.push(file);
      }
      onChange([...files, ...valid]);
    },
    [files, onChange]
  );

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-zinc-400 bg-zinc-50 dark:bg-zinc-900"
            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
        }`}
      >
        <UploadCloud className="h-6 w-6 text-zinc-400" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Drag & drop files here, or click to browse
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          PNG, JPG, PDF, MP4 — up to {MAX_UPLOAD_SIZE_MB}MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_ATTACHMENT_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => {
            const Icon = iconFor(file);
            const preview = file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : null;
            return (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2"
              >
                {preview ? (
                  // Local blob: preview — next/image's optimizer can't
                  // fetch a blob URL, so a raw <img> is the correct choice.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt=""
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
                    <Icon className="h-5 w-5 text-zinc-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-800 dark:text-zinc-200">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
