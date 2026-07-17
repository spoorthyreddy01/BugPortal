import cloudinary from "@/lib/cloudinary";

export function generateUploadSignature(folder) {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}

async function destroyOnce(publicId, resourceType) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

// Retries with a short backoff. Treats "not found" as success — cleanup
// must be safe to run more than once (e.g. resolve → reopen → resolve).
export async function destroyWithRetry(publicId, resourceType, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await destroyOnce(publicId, resourceType);
      if (result.result === "ok" || result.result === "not found") {
        return result;
      }
      lastError = new Error(`Cloudinary destroy returned "${result.result}"`);
    } catch (err) {
      lastError = err;
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }

  console.error(
    `Cloudinary destroy failed after ${attempts} attempts for ${publicId}:`,
    lastError
  );
  throw lastError;
}
