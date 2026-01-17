import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Diagnostic ---');
    try {
        const count = await prisma.media.count();
        console.log(`✅ Success: Media table is accessible.`);
        console.log(`📊 Current record count: ${count}`);

        if (count > 0) {
            const first = await prisma.media.findFirst({
                select: { filename: true, mimeType: true, size: true }
            });
            console.log('Sample record:', first);
        }
    } catch (err) {
        console.error('❌ Error accessing Media table:');
        console.error(err);
        if (err.code === 'P2021') {
            console.error('Hint: Table does not exist in the database.');
        }
    } finally {
        await prisma.$disconnect();
        console.log('---------------------------');
    }
}

main();
