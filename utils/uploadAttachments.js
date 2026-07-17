import axios from "axios";
import { getCloudinaryResourceType } from "./cloudinaryResourceType";

// Signed direct-to-Cloudinary upload: the browser never touches Cloudinary
// credentials — it fetches a short-lived signature scoped to one folder,
// then uploads straight to Cloudinary, then registers the resulting
// public_id/secure_url as an Attachment via our own API. The file itself
// never passes through a Next.js serverless function.
export async function uploadAttachments(files, issueId, onProgress) {
  const results = [];

  for (const file of files) {
    const { data: sig } = await axios.post("/api/upload/sign", {
      folder: `bugportal/issues/${issueId}`,
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sig.apiKey);
    formData.append("timestamp", sig.timestamp);
    formData.append("signature", sig.signature);
    formData.append("folder", sig.folder);

    const resourceType = getCloudinaryResourceType(file.type);
    const { data: cloudinaryResult } = await axios.post(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`,
      formData,
      {
        onUploadProgress: onProgress
          ? (evt) =>
              onProgress(file, Math.round((evt.loaded * 100) / evt.total))
          : undefined,
      }
    );

    const { data: saved } = await axios.post(
      `/api/issues/${issueId}/attachments`,
      {
        originalFilename: file.name,
        publicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        fileType: file.type,
        fileSize: file.size,
      }
    );

    results.push(saved.attachment);
  }

  return results;
}
