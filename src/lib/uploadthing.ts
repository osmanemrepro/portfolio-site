import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getAdminFromToken } from "@/lib/admin";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 20 },
  })
    .middleware(async ({ req }) => {
      const admin = await getAdminFromToken(req);
      if (!admin) throw new Error("Yetkisiz erişim");
      return { userId: admin.id };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.name);
      return { uploadedBy: "admin" };
    }),

  documentUploader: f({
    pdf: { maxFileSize: "50MB", maxFileCount: 20 },
    "application/msword": { maxFileSize: "50MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "50MB",
      maxFileCount: 10,
    },
    "application/vnd.ms-excel": { maxFileSize: "50MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "50MB",
      maxFileCount: 10,
    },
    "application/vnd.ms-powerpoint": { maxFileSize: "50MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      maxFileSize: "50MB",
      maxFileCount: 10,
    },
    "text/plain": { maxFileSize: "50MB", maxFileCount: 20 },
    "text/csv": { maxFileSize: "50MB", maxFileCount: 20 },
    "text/markdown": { maxFileSize: "50MB", maxFileCount: 20 },
    "application/json": { maxFileSize: "50MB", maxFileCount: 20 },
    "application/xml": { maxFileSize: "50MB", maxFileCount: 20 },
  })
    .middleware(async ({ req }) => {
      const admin = await getAdminFromToken(req);
      if (!admin) throw new Error("Yetkisiz erişim");
      return { userId: admin.id };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Document upload complete:", file.name);
      return { uploadedBy: "admin" };
    }),

  mediaUploader: f({
    video: { maxFileSize: "50MB", maxFileCount: 5 },
    audio: { maxFileSize: "50MB", maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      const admin = await getAdminFromToken(req);
      if (!admin) throw new Error("Yetkisiz erişim");
      return { userId: admin.id };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Media upload complete:", file.name);
      return { uploadedBy: "admin" };
    }),

  archiveUploader: f({
    blob: { maxFileSize: "50MB", maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      const admin = await getAdminFromToken(req);
      if (!admin) throw new Error("Yetkisiz erişim");
      return { userId: admin.id };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Archive upload complete:", file.name);
      return { uploadedBy: "admin" };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
