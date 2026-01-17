import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Final Media Fix Attempt ---');

    if (!fs.existsSync('media_urls.txt')) {
        console.error('media_urls.txt missing');
        return;
    }

    const lines = fs.readFileSync('media_urls.txt', 'utf8').split('\n').filter(Boolean);

    for (const line of lines) {
        const [filename, url] = line.split('|').map(s => s.trim());
        if (!url || url === 'NULL') continue;

        console.log(`🎬 Fixing ${filename}...`);

        try {
            // Direct access to the internal model name if needed
            const model = prisma.media;

            await model.upsert({
                where: { filename },
                update: { url },
                create: {
                    filename,
                    url,
                    originalName: filename,
                    mimeType: filename.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
                    size: 0,
                    folder: filename.startsWith('video') ? 'videos' : 'images',
                    publicId: filename.split('.')[0]
                }
            });
            console.log(`   ✅ Done`);
        } catch (e) {
            console.error(`   ❌ Error: ${e.message}`);
        }
    }

    const count = await prisma.media.count();
    console.log(`🏁 Total media items in DB: ${count}`);
}

main().finally(() => prisma.$disconnect());
