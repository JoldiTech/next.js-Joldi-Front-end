import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const cacheDir = path.join(process.cwd(), '.next/cache/images');
    
    if (fs.existsSync(cacheDir)) {
      // Recursively delete the directory
      fs.rmSync(cacheDir, { recursive: true, force: true });
      // Recreate the empty directory
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    return NextResponse.json({ cleared: true });
  } catch (err) {
    console.error('Error clearing cache:', err);
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
}
