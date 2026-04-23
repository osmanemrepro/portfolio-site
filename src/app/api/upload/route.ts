import { NextRequest, NextResponse } from "next/server";
import { uploadToBlob } from "@/lib/blob";
import { getAdminFromToken } from "@/lib/admin";

// POST /api/upload — upload file to Vercel Blob
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Dosya boyutu 10MB'dan küçük olmalı" }, { status: 400 });
    }

    const blob = await uploadToBlob(file, file.name, {
      contentType: file.type,
    });

    // Use downloadUrl for private blobs so files are accessible
    const fileUrl = blob.downloadUrl || blob.url;

    return NextResponse.json({
      url: fileUrl,
      pathname: blob.pathname,
      size: blob.size,
      name: file.name,
      type: file.type,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Dosya yüklenirken hata oluştu" }, { status: 500 });
  }
}
