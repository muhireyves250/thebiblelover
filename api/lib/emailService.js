/**
 * Mock Email Service
 * In a production environment, this would use nodemailer, SendGrid, or similar.
 */
const sendEmail = async ({ to, subject, body, type }) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Log the simulation to the console
    console.log(`----------------------------------------`);
    console.log(`📧 [MAIL SERVICE] Simulation`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Type:    ${type || 'GENERAL'}`);
    console.log(`Content: ${body.substring(0, 100)}...`);
    console.log(`----------------------------------------`);

    return { success: true };
};

export const emailService = {
    sendWelcome: (to, name) => sendEmail({
        to,
        subject: `Welcome to The Bible Lover, ${name}!`,
        body: `We're so glad you've joined our community. Explore reflections, join discussions, and stay rooted in the Word.`,
        type: 'WELCOME'
    }),

    sendNewsletter: (to) => sendEmail({
        to,
        subject: `Weekly Reflection: Staying Rooted`,
        body: `Here is your weekly grain of wisdom from The Bible Lover community...`,
        type: 'NEWSLETTER'
    }),

    sendPrayerAlert: (to, name, requesterName) => sendEmail({
        to,
        subject: `Community Prayer Alert`,
        body: `Hi ${name}, ${requesterName} just shared a new prayer request. Your support and prayers would mean a lot.`,
        type: 'PRAYER'
    })
};
