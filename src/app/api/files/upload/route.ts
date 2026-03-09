/**
 * POST /api/files/upload?folder=products
 *
 * Uploads files to Cloudinary. Replaces the Python backend's /files/upload.
 * Accepts multipart/form-data with one or more files in the "files" field.
 *
 * Query params:
 *   - folder: 'products' (default) | 'categories' | 'uploads'
 *
 * Response matches Python backend shape:
 *   { success: true, message: "...", data: null, listData: ["url1", "url2"] }
 */
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5 MB

// ─── Cloudinary Config ────────────────────────────────────────────────────────

function ensureCloudinaryConfigured(): void {
  if (!process.env.CLOUDINARY_CLOUD_NAME || 
      !process.env.CLOUDINARY_API_KEY || 
      !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_NOT_CONFIGURED');
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// ─── MIME Detection (magic bytes) ─────────────────────────────────────────────

function sniffMime(buffer: Buffer): string | null {
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }
  if (buffer.length >= 8 && 
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
      buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) {
    return 'image/png';
  }
  if (buffer.length >= 12 &&
      buffer.slice(0, 4).toString() === 'RIFF' &&
      buffer.slice(8, 12).toString() === 'WEBP') {
    return 'image/webp';
  }
  if (buffer.slice(0, 4).toString() === '%PDF') {
    return 'application/pdf';
  }
  return null;
}

// ─── Upload to Cloudinary ─────────────────────────────────────────────────────

async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  filename: string,
): Promise<string> {
  const mime = sniffMime(buffer);
  if (!mime || !['image/jpeg', 'image/png', 'image/webp'].includes(mime)) {
    throw new Error('INVALID_FILE_TYPE');
  }

  if (buffer.length > MAX_UPLOAD_SIZE) {
    throw new Error('FILE_TOO_LARGE');
  }

  // Sanitize filename: remove extension, keep only alphanumeric + dash/underscore
  const sanitized = filename
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 50);

  const publicId = `${folder}/${randomUUID()}_${sanitized}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: 'image', overwrite: false },
      (err, result) => {
        if (err) return reject(err);
        if (!result?.secure_url) return reject(new Error('No URL returned from Cloudinary'));
        resolve(result.secure_url);
      },
    ).end(buffer);
  });
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    ensureCloudinaryConfigured();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Cloudinary not configured', data: null, listData: null },
      { status: 503 },
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const rawFolder = searchParams.get('folder') || 'products';
  const folder = ['products', 'categories', 'uploads'].includes(rawFolder) ? rawFolder : 'products';

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No files provided',
        data: null,
        listData: [],
      });
    }

    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const url = await uploadToCloudinary(buffer, folder, file.name);
        urls.push(url);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        errors.push(`${file.name}: ${msg}`);
      }
    }

    // Return success with all successful URLs, even if some files failed
    return NextResponse.json({
      success: true,
      message: errors.length > 0 
        ? `Uploaded ${urls.length} file(s). ${errors.length} failed.`
        : 'Files uploaded successfully',
      data: null,
      listData: urls,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'File upload failed',
        data: null,
        listData: null,
      },
      { status: 500 },
    );
  }
}
