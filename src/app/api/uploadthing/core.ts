import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  fileUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 20 },
    pdf: { maxFileSize: "4MB", maxFileCount: 20 },
    "text/plain": { maxFileSize: "4MB", maxFileCount: 20 },
    blob: { maxFileSize: "4MB", maxFileCount: 20 },
  })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.name, file.key);
      return { uploadedBy: "admin" };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
