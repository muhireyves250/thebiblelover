import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting URL migration...');

    const productionApiUrl = 'https://bible-project-api.onrender.com';

    // 1. Fix BibleVerse images
    const verses = await prisma.bibleVerse.findMany({
        where: {
            image: {
                contains: 'localhost:5000'
            }
        }
    });

    console.log(`📝 Found ${verses.length} bible verses with localhost URLs.`);

    for (const verse of verses) {
        const newImageUrl = verse.image.replace(/http:\/\/localhost:5000/g, productionApiUrl);
        await prisma.bibleVerse.update({
            where: { id: verse.id },
            data: { image: newImageUrl }
        });
        console.log(`✅ Updated verse: ${verse.book} ${verse.chapter}:${verse.verse}`);
    }

    // 2. Fix SystemSettings (heroSection, backgroundSettings, etc.)
    const settings = await prisma.systemSetting.findMany();
    console.log(`📝 Checking ${settings.length} system setting categories...`);

    for (const setting of settings) {
        let updated = false;
        let settingsData = { ...setting.settings };

        // Recursively replace URLs in the settings object
        const replaceUrls = (obj) => {
            for (const key in obj) {
                if (typeof obj[key] === 'string' && obj[key].includes('localhost:5000')) {
                    obj[key] = obj[key].replace(/http:\/\/localhost:5000/g, productionApiUrl);
                    updated = true;
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    replaceUrls(obj[key]);
                }
            }
        };

        replaceUrls(settingsData);

        if (updated) {
            await prisma.systemSetting.update({
                where: { id: setting.id },
                data: { settings: settingsData }
            });
            console.log(`✅ Updated system setting category: ${setting.key}`);
        }
    }

    console.log('✨ URL migration completed!');
}

main()
    .catch((e) => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
