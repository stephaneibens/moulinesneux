import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const MAX_SIZE = 70 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Le fichier dépasse la taille maximale de 70 MB' }, { status: 400 });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = uniqueSuffix + '-' + safeName;

    const blob = await put(filename, file, { 
      access: 'public',
      addRandomSuffix: false 
    });

    return NextResponse.json({ url: blob.url });
  } catch (e: any) {
    console.error('Erreur upload:', e);
    return NextResponse.json({ error: e.message || "Erreur lors de l'upload du fichier" }, { status: 500 });
  }
}
