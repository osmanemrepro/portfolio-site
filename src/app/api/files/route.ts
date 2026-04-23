import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminFromToken } from "@/lib/admin";
import { deleteFromBlob } from "@/lib/blob";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// GET /api/files — list all uploaded files
export async function GET() {
  try {
    const files = await db.uploadedFile.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(files);
  } catch {
    return NextResponse.json({ error: "Dosyalar yüklenemedi" }, { status: 500 });
  }
}

// POST /api/files — register uploaded files in database
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await request.json();
    const { files, category } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "Dosya verisi bulunamadı" }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const fileRecord = await db.uploadedFile.create({
        data: {
          filename: file.pathname || file.name,
          originalName: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size || 0,
          url: file.url,
          category: category || "general",
          uploadThingKey: null,
        },
      });

      uploadedFiles.push({
        ...fileRecord,
        sizeFormatted: formatFileSize(fileRecord.size),
      });
    }

    return NextResponse.json({
      files: uploadedFiles,
      message: `${uploadedFiles.length} dosya başarıyla kaydedildi`,
    });
  } catch (err) {
    console.error("File register error:", err);
    return NextResponse.json({ error: "Dosya kaydedilirken hata oluştu" }, { status: 500 });
  }
}

// DELETE /api/files — delete file from database and Vercel Blob
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Dosya ID gerekli" }, { status: 400 });
    }

    const file = await db.uploadedFile.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
    }

    // Delete from Vercel Blob
    try {
      await deleteFromBlob(file.url);
    } catch (err) {
      console.error("Blob delete error:", err);
    }

    // Delete from database
    await db.uploadedFile.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Dosya silindi" });
  } catch {
    return NextResponse.json({ error: "Dosya silinemedi" }, { status: 500 });
  }
}
