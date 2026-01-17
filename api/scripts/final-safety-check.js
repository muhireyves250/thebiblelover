import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const allMedia = await prisma.media.findMany({
        select: { id: true, filename: true, url: true }
    });

    const missing = allMedia.filter(m => !m.url);

    if (missing.length > 0) {
        console.error(`🛑 CRITICAL: ${missing.length} items are missing Cloudinary URLs!`);
        missing.forEach(m => console.log(` - ${m.filename}`));
        process.exit(1);
    }

    console.log(`✅ SUCCESS: All ${allMedia.length} items have Cloudinary URLs. It is safe to drop the binary data column.`);
}

main().finally(() => prisma.$disconnect());
