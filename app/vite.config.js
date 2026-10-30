import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// 빌드 번호 = 커밋 해시 앞 7자(GitHub Actions는 GITHUB_SHA, 로컬은 git). 도움말에 보이고, 배포본의 version.json과 비교해 새 빌드를 알아챈다
function buildId() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try { return execSync('git rev-parse --short=7 HEAD', { encoding: 'utf8' }).trim(); } catch { return 'dev'; }
}
const BUILD_ID = buildId();

function versionFile() {
  return {
    name: 'version-file',
    apply: 'build',
    // KRDS 글꼴/CSS 링크에 빌드 번호를 붙여 브라우저가 옛 파일을 쓰지 않게 한다
    transformIndexHtml(html) { return html.replace(/(href="[^"]*(?:krds[^"]*\.css|favicon[^"]*\.(?:svg|png)|apple-touch-icon\.png))"/g, `$1?v=${BUILD_ID}"`); },
    closeBundle() {
      const out = fileURLToPath(new URL('./dist', import.meta.url));
      const dir = process.env.VITE_OUT_DIR || out;
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'version.json'), JSON.stringify({ build: BUILD_ID }));
    },
  };
}

const serverSrc = fileURLToPath(new URL('../server/src', import.meta.url));

// 정적 배포(GitHub Pages): VITE_STATIC=1, VITE_BASE=/public-repo-krds/
// 1) 검색 색인 원본 두 파일을 dist/data로 복사 2) 새로고침해도 화면이 열리도록 index.html을 404.html로 복사
function staticPages() {
  return {
    name: 'static-pages',
    apply: 'build',
    closeBundle() {
      if (process.env.VITE_STATIC !== '1') return;
      const out = fileURLToPath(new URL('./dist', import.meta.url));
      fs.mkdirSync(path.join(out, 'data'), { recursive: true });
      for (const f of ['projects.csv', 'gitlab-public-snapshot.json']) {
        fs.copyFileSync(path.join(serverSrc, '../data', f), path.join(out, 'data', f));
      }
      fs.copyFileSync(path.join(out, 'index.html'), path.join(out, '404.html'));
    },
  };
}

// 서버 주소는 환경변수로 바꿀 수 있다(검사용으로 다른 포트를 쓸 때).
const apiTarget = process.env.API_TARGET || 'http://127.0.0.1:5732';
const proxy = () => ({ '/api': { target: apiTarget }, '/auth': { target: apiTarget } });

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), staticPages(), versionFile()],
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  resolve: { alias: { '@server': serverSrc } },
  preview: { proxy: proxy() },
  server: {
    port: 5731,
    strictPort: true,
    host: '127.0.0.1',
    fs: { allow: ['..'] },
    proxy: proxy(),
  },
});
