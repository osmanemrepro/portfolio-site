import { NextRequest, NextResponse } from "next/server";
import { generatePresignedUploadUrl, getR2PublicUrl, r2Bucket } from "@/lib/r2";
import { getAdminFromToken } from "@/lib/admin";

// POST /api/upload — generate a presigned URL for direct client upload to R2
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, fileType, fileSize } = body;

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Dosya adı ve türü gerekli" }, { status: 400 });
    }

    // Max 10MB per file
    if (fileSize && fileSize > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Dosya boyutu 10MB'dan küçük olmalı" }, { status: 400 });
    }

    // Generate a unique key: uploads/YYYY/MM/filename-timestamp.ext
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const datePrefix = new Date().toISOString().slice(0, 7).replace("-", "/");
    const key = `uploads/${datePrefix}/${timestamp}-${safeName}`;

    const presignedUrl = await generatePresignedUploadUrl(key, fileType);
    const publicUrl = getR2PublicUrl(key);

    return NextResponse.json({
      presignedUrl,
      key,
      publicUrl,
    });
  } catch (err) {
    console.error("Upload presign error:", err);
    return NextResponse.json({ error: "Presigned URL oluşturulamadı" }, { status: 500 });
  }
}
