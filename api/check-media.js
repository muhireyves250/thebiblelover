import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const filenames = [
    'image-1768673250151-489928343.jpg',
    'video-1768661934855-139176212.mp4'
];

async function main() {
    console.log('--- Checking Media Records ---');
    for (const filename of filenames) {
        console.log(`\nChecking: ${filename}`);
        const record = await prisma.media.findUnique({
            where: { filename }
        });

        if (record) {
            console.log('✅ Found in DB');
            console.log('Storage:', record.url ? 'Cloudinary' : (record.data ? 'Database Blob' : 'Disk/Missing'));
            if (record.url) console.log('URL:', record.url);
        } else {
            console.log('❌ Not found in DB');
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
