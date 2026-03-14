import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const categories = [
        {
            name: 'General Discussion',
            description: 'The main place for community-wide discussions and getting to know each other.',
            icon: 'MessageSquare',
            order: 1
        },
        {
            name: 'Scripture Study',
            description: 'Deep dives into specific verses, chapters, and theological questions.',
            icon: 'BookOpen',
            order: 2
        },
        {
            name: 'Testimonies',
            description: 'Share what God is doing in your life and be an encouragement to others.',
            icon: 'Sparkles',
            order: 3
        },
        {
            name: 'Prayer & Support',
            description: 'A space for deeper prayer requests and supporting those in difficult seasons.',
            icon: 'Heart',
            order: 4
        },
        {
            name: 'Ministry & Outreach',
            description: 'Discuss community projects, volunteering, and sharing the Gospel.',
            icon: 'Users',
            order: 5
        }
    ];

    console.log('Seeding forum categories...');

    for (const cat of categories) {
        await prisma.forumCategory.upsert({
            where: { id: cat.name.toLowerCase().replace(/ /g, '-') }, // Simple ID generation for seeding
            update: cat,
            create: {
                ...cat,
                id: cat.name.toLowerCase().replace(/ /g, '-')
            }
        });
    }

    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
