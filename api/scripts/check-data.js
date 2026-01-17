import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const blogs = await prisma.blogPost.count();
    const settings = await prisma.systemSetting.count();
    const media = await prisma.media.count();

    console.log('--- Database Content Check ---');
    console.log(`Blog Posts: ${blogs}`);
    console.log(`System Settings: ${settings}`);
    console.log(`Media Items: ${media}`);
}

main().finally(() => prisma.$disconnect());
