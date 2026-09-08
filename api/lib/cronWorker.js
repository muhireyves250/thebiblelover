import cron from 'node-cron';
import { prisma } from './prisma.js';
import fetch from 'node-fetch';

/**
 * Spiritual Autonomy Worker
 * Handles scheduled publications, weekly newsletters, and system maintenance.
 */
export const initCronJobs = () => {
    console.log('🙏 Initializing Spiritual Autonomy Cron Jobs...');

    // 1. Every Hour: Check for newly published scheduled posts
    // This job finds posts whose publishedAt date has passed but still need "alerts" sent.
    cron.schedule('0 * * * *', async () => {
        console.log('⏰ Running Publication Check...');
        try {
            const now = new Date();
            const anHourAgo = new Date(now.getTime() - (60 * 60 * 1000));

            // Find posts published in the last hour
            const recentPosts = await prisma.blogPost.findMany({
                where: {
                    status: 'PUBLISHED',
                    publishedAt: {
                        lte: now,
                        gt: anHourAgo
                    }
                },
                include: { author: true }
            });

            if (recentPosts.length > 0) {
                console.log(`📡 Found ${recentPosts.length} new publications. Triggering alerts...`);
                
                for (const post of recentPosts) {
                    // Create system notifications for all active users
                    const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } });
                    
                    const notifications = users.map(user => ({
                        userId: user.id,
                        type: 'ARTICLE_PUBLISHED',
                        title: 'New Word Available',
                        message: `"${post.title}" by ${post.author.name} is now live!`,
                        link: `/posts/${post.slug}`
                    }));

                    await prisma.notification.createMany({ data: notifications });
                    console.log(`✅ Notifications sent for: ${post.title}`);
                }
            }
        } catch (error) {
            console.error('❌ Publication Check Error:', error.message);
        }
    });

    // 2. Every Sunday at Midnight: Weekly Grains of Wisdom Newsletter
    cron.schedule('0 0 * * 0', async () => {
        console.log('🕊️ Compiling Weekly Grains of Wisdom...');
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // Get top 3 most viewed posts of the week
            const topPosts = await prisma.blogPost.findMany({
                where: {
                    status: 'PUBLISHED',
                    publishedAt: { gte: oneWeekAgo }
                },
                orderBy: { views: 'desc' },
                take: 3
            });

            if (topPosts.length > 0 && process.env.NEWSLETTER_API_KEY) {
                console.log('📧 Triggering weekly newsletter campaign via Brevo...');
                
                // This is a simplified bridge to Brevo/Mailchimp
                // In a production app, you would use their "Campaign" API or "Transactional" API
                const subscriberCount = await prisma.newsletterSubscriber.count({ where: { isActive: true } });
                console.log(`📤 Sending to ${subscriberCount} subscribers...`);
                
                // Simulated Campaign Trigger
                // await fetch('https://api.brevo.com/v3/emailCampaigns', { ... });
            }
        } catch (error) {
            console.error('❌ Weekly Newsletter Error:', error.message);
        }
    });

    // 3. Every 10 Minutes: Self-ping to prevent the free-tier instance from
    // idling out. Render (and similar free hosts) spin the process down after
    // ~15 minutes with no inbound HTTP traffic; this keeps traffic flowing so
    // it never gets the chance to sleep in the first place. Only meaningful
    // once the process is already running — an external ping (see the
    // keep-alive GitHub Action) is what wakes it back up if it ever does sleep.
    const selfUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
    if (selfUrl) {
        cron.schedule('*/10 * * * *', async () => {
            try {
                const res = await fetch(`${selfUrl}/api/health`);
                console.log(`💓 Keep-alive ping: ${res.status}`);
            } catch (error) {
                console.error('❌ Keep-alive ping failed:', error.message);
            }
        });
        console.log(`💓 Self-ping keep-alive scheduled against ${selfUrl}`);
    } else {
        console.log('ℹ️ Skipping self-ping keep-alive (no RENDER_EXTERNAL_URL/BACKEND_URL set)');
    }

    console.log('✅ Cron Jobs Scheduled Successfully');
};
