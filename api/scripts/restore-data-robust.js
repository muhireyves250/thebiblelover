import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Robust Restoration ---');

    // 1. Restore Media Metadata
    if (fs.existsSync('media_urls.txt')) {
        const lines = fs.readFileSync('media_urls.txt', 'utf8').split('\n').filter(Boolean);
        console.log(`🎬 Processing ${lines.length} media items...`);

        for (const line of lines) {
            const parts = line.split('|').map(s => s.trim());
            if (parts.length < 2) continue;

            const filename = parts[0];
            const url = parts[1];
            if (!url || url === 'NULL') continue;

            const folder = filename.startsWith('video') ? 'videos' : 'images';
            const mimeType = filename.endsWith('.png') ? 'image/png' :
                filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' :
                    filename.endsWith('.mp4') ? 'video/mp4' : 'application/octet-stream';

            let publicId = null;
            try {
                if (url.includes('/upload/')) {
                    const urlParts = url.split('/upload/')[1].split('/');
                    urlParts.shift(); // remove version
                    const fullPublicId = urlParts.join('/');
                    publicId = fullPublicId.split('.')[0];
                }
            } catch (e) {
                // ignore
            }

            try {
                const mediaModel = prisma.media || prisma['media'];
                if (!mediaModel) throw new Error('Prisma.media is undefined');

                await mediaModel.upsert({
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
                console.log(`   ✅ Restored Media: ${filename}`);
            } catch (err) {
                console.error(`   ❌ Failed Media: ${filename} ->`, err.message);
            }
        }
    }

    // 2. Restore System Settings
    const settingsPath = path.join('data', 'settings.json');
    if (fs.existsSync(settingsPath)) {
        console.log('⚙️ Restoring System Settings...');
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

        for (const [category, value] of Object.entries(settings)) {
            try {
                const settingsModel = prisma.systemSetting || prisma['systemSetting'];
                if (!settingsModel) throw new Error('Prisma.systemSetting is undefined');

                await settingsModel.upsert({
                    where: { category },
                    update: { value },
                    create: { category, value }
                });
                console.log(`   ✅ Restored Setting: ${category}`);
            } catch (err) {
                console.error(`   ❌ Failed Setting: ${category} ->`, err.message);
            }
        }
    }

    console.log('--- Restoration Finished ---');
}

main()
    .catch(e => console.error('FATAL:', e))
    .finally(() => prisma.$disconnect());
