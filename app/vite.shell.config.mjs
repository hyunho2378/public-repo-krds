// 공통 틀 갈래 검사용 개발 서버(포트 5743, API 5733). 배포 설정(vite.config.js)과 별개.
import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config.js';
export default mergeConfig(base, defineConfig({ server: { port: 5743, strictPort: true, host: '127.0.0.1', proxy: { '/api': { target: 'http://127.0.0.1:5733' }, '/auth': { target: 'http://127.0.0.1:5733' } } } }));
