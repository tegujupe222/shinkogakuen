import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json(
                { error: 'ファイルが選択されていません' },
                { status: 400 }
            );
        }

        // PDFファイルのみ許可
        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'PDFファイルのみアップロード可能です' },
                { status: 400 }
            );
        }

        // ファイルサイズ制限 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'ファイルサイズは10MB以下にしてください' },
                { status: 400 }
            );
        }

        // ファイル名を安全にする
        const timestamp = Date.now();
        const safeFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Vercel Blobにアップロード
        const blob = await put(safeFileName, file, {
            access: 'public',
            addRandomSuffix: false,
        });

        return NextResponse.json({
            success: true,
            message: 'ファイルをアップロードしました',
            fileName: file.name,
            fileUrl: blob.url,
            fileSize: file.size
        });

    } catch (error) {
        console.error('Failed to upload file:', error);
        return NextResponse.json(
            { error: 'ファイルのアップロードに失敗しました' },
            { status: 500 }
        );
    }
}
