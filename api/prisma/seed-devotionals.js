import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding devotionals...');

    // Get an admin user for authorship
    const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!admin) {
        console.error('No admin user found. Please seed users first.');
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const devotionals = [
        {
            date: today,
            title: 'Finding Peace in the Storm',
            scripture: 'Mark 4:39 - "He stood up, rebuked the wind and said to the waves, \'Quiet! Be still!\' Then the wind died down and it was completely calm."',
            content: `The storms of life often arrive without warning. One moment the sea is calm, and the next, waves are crashing over the bow. The disciples, seasoned fishermen, were terrified. Yet, Jesus was sleeping.

When they woke Him, He didn't just manage the situation—He commanded the source. "Peace, be still." 

Today, you might be facing a financial storm, a health crisis, or internal turmoil. Remember that the same Jesus who commanded the Galilean sea is in the boat with you. He is not surprised by the wind. He is the Master of it.

Reflection: What "wind" is blowing strongest in your life right now? Lift it to Him and listen for His voice saying, "Quiet! Be still!"`,
            reflectionQuestions: '1. Why do we often forget Jesus is with us in the storm?\n2. How can you practice "being still" today?',
            authorId: admin.id
        },
        {
            date: new Date(today.getTime() - 86400000), // Yesterday
            title: 'The Power of Generosity',
            scripture: '2 Corinthians 9:7 - "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."',
            content: `Generosity is not about the amount; it's about the heart. God is the ultimate giver, and when we give, we reflect His character.

Whether it's your time, your resources, or an encouraging word, giving breaks the power of selfishness in our lives. It acknowledges that everything we have is a gift from Him.`,
            reflectionQuestions: 'Who can you be generous toward today?',
            authorId: admin.id
        }
    ];

    for (const d of devotionals) {
        await prisma.devotional.upsert({
            where: { date: d.date },
            update: {
                title: d.title,
                content: d.content,
                scripture: d.scripture,
                reflectionQuestions: d.reflectionQuestions,
                authorId: d.authorId
            },
            create: d
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
