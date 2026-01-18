import fetch from 'node-fetch';

const CLOUDINARY_URL = 'https://res.cloudinary.com/dbuuqmq1j/video/upload/v1768669824/bible-project/videos/video-1768661934855-139176212.mp4';

async function testCloudinary() {
    console.log(`Testing: ${CLOUDINARY_URL}`);
    try {
        const res = await fetch(CLOUDINARY_URL, { method: 'HEAD' });
        console.log(`Status: ${res.status} ${res.statusText}`);
        console.log('Content-Type:', res.headers.get('content-type'));
        console.log('Content-Length:', res.headers.get('content-length'));

        if (res.ok) {
            console.log('✅ Video is accessible on Cloudinary.');
        } else {
            console.log('❌ Video is NOT accessible.');
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

testCloudinary();
