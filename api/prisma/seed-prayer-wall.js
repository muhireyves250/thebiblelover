import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding prayer requests...');

    const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!admin) {
        console.error('No admin user found. Please seed users first.');
        return;
    }

    const requests = [
        {
            title: 'Healing for my Mother',
            content: 'My mother was just diagnosed with a serious illness. Please pray for her strength, for the doctors treating her, and for peace over our family during this season.',
            category: 'HEALING',
            isAnonymous: false,
            userId: admin.id
        },
        {
            title: 'Guidance on a Career Decision',
            content: 'I have been offered a new job that would mean relocating my family. Praying for wisdom and a clear sense of God\'s will as we weigh this decision.',
            category: 'GUIDANCE',
            isAnonymous: false,
            guestName: 'Sarah M.',
            guestEmail: 'sarah.m@example.com'
        },
        {
            title: 'Restored Relationship with My Son',
            content: 'It has been two years since my son and I last spoke. Please pray for softened hearts and an opportunity for reconciliation.',
            category: 'FAMILY',
            isAnonymous: true,
            guestName: 'Anonymous Parent',
            guestEmail: 'anon.parent@example.com'
        },
        {
            title: 'Strength Through Grief',
            content: 'We lost my father last month. Praying for comfort for our whole family and strength to keep trusting God through the grief.',
            category: 'STRENGTH',
            isAnonymous: false,
            userId: admin.id
        },
        {
            title: 'Thankful for a Safe Delivery',
            content: 'Our daughter was born healthy last week after a difficult pregnancy. Giving thanks to God for His faithfulness and protection over us.',
            category: 'THANKSGIVING',
            isAnonymous: false,
            status: 'ANSWERED',
            guestName: 'James & Nina',
            guestEmail: 'james.nina@example.com'
        },
        {
            title: 'Financial Provision',
            content: 'Our small business has been struggling this quarter. Praying for wisdom in managing our finances and for God\'s provision to meet our needs.',
            category: 'OTHER',
            isAnonymous: false,
            guestName: 'David K.',
            guestEmail: 'david.k@example.com'
        }
    ];

    for (const r of requests) {
        await prisma.prayerRequest.create({ data: r });
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
