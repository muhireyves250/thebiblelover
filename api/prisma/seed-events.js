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
            thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
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
        },
        {
            title: 'Community Food Drive',
            description: 'Help us pack and distribute meals for families in need across the city. Volunteers of all ages welcome - no experience necessary.',
            date: new Date(new Date(nextWeek).setDate(nextWeek.getDate() + 6)),
            location: 'Fellowship Hall',
            type: 'COMMUNITY',
            thumbnail: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=800',
            authorId: admin.id
        },
        {
            title: 'Youth Game Night',
            description: 'A night of games, snacks, and fellowship for middle and high schoolers. Bring a friend!',
            date: new Date(new Date(nextWeek).setDate(nextWeek.getDate() + 10)),
            location: 'Youth Center',
            type: 'YOUTH',
            thumbnail: 'https://images.unsplash.com/photo-1470075801209-17f9ec0cada6?auto=format&fit=crop&q=80&w=800',
            authorId: admin.id
        },
        {
            title: 'Sunday Morning Prayer Gathering',
            description: 'Start the week grounded in prayer. We will lift up our community, our city, and one another before the service begins.',
            date: new Date(new Date(nextWeek).setDate(nextWeek.getDate() + 13)),
            location: 'Prayer Chapel',
            type: 'WORSHIP',
            thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
            authorId: admin.id
        }
    ];

    for (const e of events) {
        const existing = await prisma.event.findFirst({ where: { title: e.title } });
        if (existing) continue;
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
