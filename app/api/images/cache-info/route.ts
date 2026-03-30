import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const cacheDir = path.join(process.cwd(), '.next/cache/images');
    
    if (!fs.existsSync(cacheDir)) {
      return NextResponse.json([]);
    }

    const files: any[] = [];
    
    const walk = (dir: string) => {
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          walk(filePath);
        } else {
          // Next.js image cache files are usually named with a hash
          // and they might not have an extension, or they might be in subdirectories
          files.push({
            filename: file,
            path: filePath,
            size: stat.size,
            createdAt: stat.birthtime,
            // We can't easily get width/height/format without reading the file content
            // but we can provide the basic info
            width: '?',
            height: '?',
            format: path.extname(file).replace('.', '') || 'unknown'
          });
        }
      });
    };

    walk(cacheDir);
    
    // Sort by most recent
    files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return NextResponse.json(files.slice(0, 100)); // Limit to 100 for performance
  } catch (err) {
    console.error('Error fetching cache info:', err);
    return NextResponse.json({ error: 'Failed to fetch cache info' }, { status: 500 });
  }
}
