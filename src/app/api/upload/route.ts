import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const user = await getCurrentUser();
        if (!user) {
          throw new Error('Non autorisé');
        }
        return {
          maximumSizeInBytes: 70 * 1024 * 1024, // 70MB
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error('Erreur upload client:', error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'upload du fichier" },
      { status: 400 }
    );
  }
}
