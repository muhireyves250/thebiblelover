import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        console.log("CONNECTION_STATUS: OK");
        const count = await prisma.media.count();
        console.log("RECORD_COUNT: " + count);
        process.exit(0);
    } catch (e) {
        console.log("CONNECTION_STATUS: FAILED");
        console.error(e);
        process.exit(1);
    }
}

main();
