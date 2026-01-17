import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Restoration ---');

    // 1. Restore Media
    if (fs.existsSync('media_urls.txt')) {
        const lines = fs.readFileSync('media_urls.txt', 'utf8').split('\n').filter(Boolean);
        console.log(`🎬 Processing ${lines.length} media items...`);

        for (const line of lines) {
            const parts = line.split('|').map(s => s.trim());
            if (parts.length < 2) continue;

            const filename = parts[0];
            const url = parts[1];
            if (url === 'NULL') continue;

            const folder = filename.startsWith('video') ? 'videos' : 'images';
            const mimeType = filename.endsWith('.png') ? 'image/png' :
                filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' :
                    filename.endsWith('.mp4') ? 'video/mp4' : 'application/octet-stream';

            let publicId = null;
            try {
                const urlParts = url.split('/upload/')[1].split('/');
                urlParts.shift(); // remove version
                const fullPublicId = urlParts.join('/');
                publicId = fullPublicId.split('.')[0];
            } catch (e) {
                console.warn(`      ⚠️ Could not parse publicId for ${filename}`);
            }

            try {
                await prisma.media.upsert({
                    where: { filename },
                    update: { url, publicId, folder, mimeType },
                    create: {
                        filename,
                        url,
                        publicId,
                        folder,
                        mimeType,
                        originalName: filename,
                        size: 0
                    }
                });
                console.log(`   ✅ Restored: ${filename}`);
            } catch (err) {
                console.error(`   ❌ Failed: ${filename}`, err.message);
            }
        }
    }

    // 2. Restore Settings
    const settingsPath = path.join('data', 'settings.json');
    if (fs.existsSync(settingsPath)) {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        for (const [category, value] of Object.entries(settings)) {
            await prisma.systemSetting.upsert({
                where: { category },
                update: { value },
                create: { category, value }
            });
        }
        console.log('✅ Settings restored.');
    }

    console.log('--- Restoration Finished ---');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
