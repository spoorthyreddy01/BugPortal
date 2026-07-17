import Image from "next/image";
import { FileText, Film } from "lucide-react";

function iconFor(fileType) {
  return fileType.startsWith("video/") ? Film : FileText;
}

export default function AttachmentList({ attachments }) {
  if (!attachments.length) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-600">
        No attachments
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {attachments.map((a) => {
        const isImage = a.fileType.startsWith("image/");
        const Icon = iconFor(a.fileType);
        return (
          <li key={a._id}>
            <a
              href={a.secureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 p-2 hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              {isImage ? (
                <Image
                  src={a.secureUrl}
                  alt={a.originalFilename}
                  width={200}
                  height={80}
                  className="h-20 w-full rounded object-cover"
                />
              ) : (
                <div className="flex h-20 w-full items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
                  <Icon className="h-6 w-6 text-zinc-400" />
                </div>
              )}
              <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                {a.originalFilename}
              </p>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
