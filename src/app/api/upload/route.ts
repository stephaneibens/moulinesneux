import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = uniqueSuffix + '-' + safeName;
    const path = join(uploadsDir, filename);

    await writeFile(path, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (e) {
    console.error('Erreur upload:', e);
    return NextResponse.json({ error: "Erreur lors de l'upload du fichier" }, { status: 500 });
  }
}
