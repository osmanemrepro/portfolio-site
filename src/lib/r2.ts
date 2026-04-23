import { S3Client, DeleteObjectCommand, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Account = process.env.R2_ACCOUNT_ID;
const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
const r2Bucket = process.env.R2_BUCKET_NAME || "portfolio-files";
const r2PublicUrl = process.env.R2_PUBLIC_URL || "";

if (!r2Account || !r2AccessKey || !r2SecretKey) {
  console.warn("R2 credentials not configured. File upload will not work.");
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${r2Account}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKey || "",
    secretAccessKey: r2SecretKey || "",
  },
});

export function getR2PublicUrl(key: string): string {
  if (r2PublicUrl) {
    return `${r2PublicUrl}/${key}`;
  }
  return `https://${r2Account}.r2.cloudflarestorage.com/${r2Bucket}/${key}`;
}

export async function generatePresignedUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: r2Bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn: 3600 });
}

export async function deleteFromR2(key: string): Promise<void> {
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: r2Bucket, Key: key }));
    console.log(`Deleted from R2: ${key}`);
  } catch (err) {
    console.error("R2 delete error:", err);
  }
}

export { r2Bucket };
