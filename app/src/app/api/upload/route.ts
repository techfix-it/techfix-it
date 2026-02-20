import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Ensure uploads directory exists
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create unique filename
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.name);
  const filename = file.name.replace(ext, '') + '-' + uniqueSuffix + ext;
  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, buffer);
  
  const imageUrl = `/uploads/${filename}`;

  return NextResponse.json({ success: true, url: imageUrl });
}
