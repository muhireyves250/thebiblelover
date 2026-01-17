import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
console.log('media property:', typeof prisma.media);
console.log('media keys:', Object.keys(prisma.media || {}));
prisma.$disconnect();
