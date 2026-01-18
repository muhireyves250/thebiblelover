import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();
const filename = 'video-1768661934855-139176212.mp4';

async function main() {
    const record = await prisma.media.findUnique({ where: { filename } });
    if (record && record.url) {
        fs.writeFileSync('video_url.txt', record.url);
        console.log('URL saved to video_url.txt');
    } else {
        console.log('Video not found or has no URL');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
