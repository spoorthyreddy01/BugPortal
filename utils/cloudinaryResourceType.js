// Cloudinary's REST API takes resource_type as part of the upload/destroy
// URL, not as a signed field, so both the upload and the later cleanup
// delete need to derive the same value from the file's mime type.
export function getCloudinaryResourceType(mimeType) {
  return mimeType?.startsWith("video/") ? "video" : "image";
}
