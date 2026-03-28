import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Preload critical hero media
if ('link' in document) {
  const heroVideoLink = document.createElement('link');
  heroVideoLink.rel = 'preload';
  heroVideoLink.as = 'fetch';
  heroVideoLink.href = 'https://res.cloudinary.com/degd6ahfu/video/upload/v1774576064/videoExport-2026-03-20_03-00-23.875-2800x1750_60fps_i9tkw1.mp4';
  document.head.appendChild(heroVideoLink);
  
  const aboutImgLink = document.createElement('link');
  aboutImgLink.rel = 'preload';
  aboutImgLink.as = 'image';
  aboutImgLink.href = 'https://res.cloudinary.com/degd6ahfu/image/upload/f_auto,q_auto,f_webp,c_fill,w_600/v1773974518/PHOTO-2026-03-17-23-00-06_ralnm5.jpg';
  document.head.appendChild(aboutImgLink);
}
