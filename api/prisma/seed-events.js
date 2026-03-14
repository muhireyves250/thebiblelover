import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding events...');

    const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!admin) {
        console.error('No admin user found. Please seed users first.');
        return;
    }

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const events = [
        {
            title: 'Wednesday Night Bible Study',
            description: 'Join us for a deep dive into the Book of Romans. We explore archaeological context and theological implications for our modern lives.',
            date: new Date(nextWeek.setHours(19, 0, 0, 0)),
            location: 'Main Sanctuary / Zoom Link: https://zoom.us/j/123456789',
            type: 'STUDY',
            thumbnail: 'https://images.unsplash.com/photo-1504052434139-44b413697eb5?auto=format&fit=crop&q=80&w=800',
            authorId: admin.id
        },
        {
            title: 'Community Worship Night',
            description: 'An evening of praise, prayer, and community. All ages are welcome as we lift our voices together.',
            date: new Date(new Date(nextWeek).setDate(nextWeek.getDate() + 3)),
            location: 'City Park Amphitheater',
            type: 'WORSHIP',
            thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800',
            authorId: admin.id
        }
    ];

    for (const e of events) {
        await prisma.event.create({
            data: e
        });
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
