
import { prisma } from '../lib/prisma.js';

async function updateHeroImage() {
    try {
        console.log('🔄 Checking current hero settings...');
        const currentSettings = await prisma.systemSetting.findUnique({
            where: { key: 'heroSection' }
        });

        if (!currentSettings) {
            console.log('⚠️ No heroSection settings found.');
            return;
        }

        console.log('Current settings:', JSON.stringify(currentSettings.settings, null, 2));

        const newImageUrl = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

        // Merge new image URL with existing settings to preserve other fields like videoUrl, title, etc.
        const newSettings = {
            ...currentSettings.settings,
            imageUrl: newImageUrl
        };

        console.log('📝 Updating to new settings:', JSON.stringify(newSettings, null, 2));

        await prisma.systemSetting.update({
            where: { key: 'heroSection' },
            data: {
                settings: newSettings
            }
        });

        console.log('✅ Successfully updated hero image URL in database.');
    } catch (error) {
        console.error('❌ Error updating hero image:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateHeroImage();
