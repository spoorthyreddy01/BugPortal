import { SESClient } from "@aws-sdk/client-ses";

let client;

// Lazily built so a missing AWS_* env var only breaks mail sending, not
// every route that happens to import this module.
export function getSESClient() {
  if (client) return client;

  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("AWS SES credentials are not configured");
  }

  client = new SESClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  return client;
}
