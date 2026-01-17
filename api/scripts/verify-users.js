import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany({ select: { email: true } });
    console.log('--- User Verification ---');
    console.log('Users found:', users.length);
    users.forEach(u => console.log(' -', u.email));
}
main().finally(() => prisma.$disconnect());
