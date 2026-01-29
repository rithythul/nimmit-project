import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "nimmit-files";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  expiresAt: Date;
}

export interface PresignedDownloadResult {
  downloadUrl: string;
  expiresAt: Date;
}

/**
 * Generate a presigned URL for uploading a file directly to R2
 */
export async function getPresignedUploadUrl(
  clientId: string,
  jobId: string,
  filename: string,
  contentType: string,
  expiresInSeconds = 3600
): Promise<PresignedUploadResult> {
  const key = `clients/${clientId}/jobs/${jobId}/${filename}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });

  return {
    uploadUrl,
    key,
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
  };
}

/**
 * Generate a presigned URL for downloading a file from R2
 * Default expiration is 1 hour
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<PresignedDownloadResult> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const downloadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });

  return {
    downloadUrl,
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
  };
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Parse a storage key to extract client and job IDs
 */
export function parseStorageKey(key: string): {
  clientId: string;
  jobId: string;
  filename: string;
} | null {
  const match = key.match(/^clients\/([^/]+)\/jobs\/([^/]+)\/(.+)$/);
  if (!match) return null;
  return {
    clientId: match[1],
    jobId: match[2],
    filename: match[3],
  };
}
