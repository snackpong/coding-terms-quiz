const APP_CHUNKS = [
  'scripts/app.part1.js',
  'scripts/app.part2.js',
  'scripts/app.part3.js',
  'scripts/app.part4.js',
];

function loadScript(path) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = path;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${path}`));
    document.head.appendChild(script);
  });
}

async function loadApplication() {
  for (const path of APP_CHUNKS) {
    await loadScript(path);
  }
}

loadApplication().catch(error => {
  console.error('Application failed to start.', error);
  const fallback = document.createElement('div');
  fallback.style.cssText = 'position:fixed;inset:16px;z-index:99999;padding:18px;border:1px solid #f99;background:#fff4f4;color:#7a1111;font:14px/1.5 sans-serif';
  fallback.textContent = '앱을 불러오지 못했습니다. 로컬 서버와 파일 경로를 확인해주세요.';
  document.body.appendChild(fallback);
});
