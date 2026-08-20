import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({plugins:[react(),VitePWA({registerType:'autoUpdate',includeAssets:['icon.svg'],manifest:{name:'Samwise Personal Planner',short_name:'Samwise',description:'A calm, local-first planning companion',theme_color:'#263F35',background_color:'#F3EBD7',display:'standalone',start_url:'/today',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]},workbox:{navigateFallback:'/index.html',globPatterns:['**/*.{js,css,html,svg}']}})]});
