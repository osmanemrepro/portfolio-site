import { put, del, list, head } from "@vercel/blob";

export async function uploadToBlob(
  file: File | Buffer,
  fileName: string,
  options?: { contentType?: string }
) {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const datePrefix = new Date().toISOString().slice(0, 7).replace("-", "/");
  const key = `uploads/${datePrefix}/${timestamp}-${safeName}`;

  const blob = await put(key, file, {
    access: "private",
    contentType: options?.contentType,
  });

  return blob;
}

export async function deleteFromBlob(url: string) {
  await del(url);
}

export async function listBlobs(prefix?: string) {
  return list({ prefix });
}

export async function getBlobInfo(url: string) {
  return head(url);
}
