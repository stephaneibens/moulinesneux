import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { put } from '@vercel/blob';

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

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = uniqueSuffix + '-' + safeName;

    const blob = await put(filename, file, { 
      access: 'public',
      addRandomSuffix: false 
    });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('Erreur upload:', e);
    return NextResponse.json({ error: "Erreur lors de l'upload du fichier" }, { status: 500 });
  }
}
