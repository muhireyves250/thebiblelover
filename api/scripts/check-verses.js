const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const verses = await prisma.bibleVerse.findMany({
        take: 5,
        select: { id: true, book: true, chapter: true, verse: true }
    });
    console.log('Verses:', verses);
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
