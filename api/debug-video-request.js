import fetch from 'node-fetch';

const LOCAL_URL = 'http://localhost:5000/api/upload/videos/video-1768661934855-139176212.mp4';

async function testVideo() {
    console.log(`Testing: ${LOCAL_URL}`);
    try {
        const res = await fetch(LOCAL_URL, {
            redirect: 'manual', // Don't automatically follow redirect
            headers: {
                'Range': 'bytes=0-'
            }
        });

        console.log(`Status: ${res.status} ${res.statusText}`);
        console.log('Headers:', res.headers.raw());

        if (res.status >= 300 && res.status < 400) {
            const location = res.headers.get('location');
            console.log(`\nRedirects to: ${location}`);

            if (location) {
                console.log('Testing destination URL...');
                const cloudRes = await fetch(location, { method: 'HEAD' });
                console.log(`Destination Status: ${cloudRes.status} ${cloudRes.statusText}`);
                console.log('Destination Content-Type:', cloudRes.headers.get('content-type'));
                console.log('Destination Content-Length:', cloudRes.headers.get('content-length'));
            }
        } else if (res.status === 200 || res.status === 206) {
            console.log('Served directly (not redirected)');
            console.log('Content-Type:', res.headers.get('content-type'));
        } else {
            console.log('Request failed or returned unexpected status');
        }

    } catch (e) {
        console.error('Error during test:', e.message);
        if (e.code === 'ECONNREFUSED') {
            console.log('Hint: Is the server running on port 5000?');
        }
    }
}

testVideo();
