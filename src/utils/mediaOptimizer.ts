export const optimizeImageUrl = (url: string, width: number = 800, options: string = 'f_auto,q_auto,f_webp,c_fill,g_face'): string => {
    const u = new URL(url);
    u.searchParams.set('w', width.toString());
    u.searchParams.set('q_auto', 'eco');
    options.split(',').forEach(opt => {
        const [key, value] = opt.split('=');
        if (key && value !== undefined) u.searchParams.set(key, value);
    });
    return u.toString();
};

export const getSrcSet = (baseUrl: string, sizes: string = '(max-width: 768px) 400w, (max-width: 1200px) 800w, 1200w') => ({
    srcSet: [400, 800, 1200, 1600].map(w => `${optimizeImageUrl(baseUrl, w)} ${w}w`).join(', '),
    sizes
});

export const optimizeVideoUrl = (url: string): string => {
    const u = new URL(url);
    u.searchParams.set('f', 'mp4');
    u.searchParams.set('q', 'auto:eco');
    return u.toString();
};

export const getOptimizedPreviewSrc = (previewImage: string, previewVideo: string) => previewVideo ? optimizeVideoUrl(previewVideo.replace('/embed/', '/video/upload/')) : optimizeImageUrl(previewImage, 640);
export const getOptimizedHeroSrc = (heroImage: string, heroVideo: string) => heroVideo ? optimizeVideoUrl(heroVideo) : optimizeImageUrl(heroImage, 1920);
