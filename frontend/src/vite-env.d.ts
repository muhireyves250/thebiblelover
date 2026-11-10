/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import 'react';

declare module 'react' {
    interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
        fetchpriority?: 'high' | 'low' | 'auto';
    }
}
