import { getFileUrl } from './FileApi';

// 저장 직전 모든 img의 src 제거 또는 공백 처리
export function sanitizeContentImages(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '', 'text/html');
  doc.querySelectorAll('img').forEach((img) => {
    img.setAttribute('src', '');
  });
  return doc.body.innerHTML;
}

// 현재 HTML에 존재하는 img[data-key] 목록 추출
export function extractImageKeys(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '', 'text/html');
  return Array.from(doc.querySelectorAll('img[data-key]'))
    .map((img) => img.getAttribute('data-key'))
    .filter(Boolean);
}

// 상세 페이지에서 data-key 기반으로 src 복원
export async function restoreImageSrc(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '', 'text/html');
  const images = Array.from(doc.querySelectorAll('img[data-key]'));

  for (const img of images) {
    const key = img.getAttribute('data-key');
    try {
      const { url } = await getFileUrl(key);
      img.setAttribute('src', url);
    } catch (err) {
      console.error('이미지 URL 복원 실패:', err);
      // 실패 시 src는 빈 값 유지
    }
  }

  return doc.body.innerHTML;
}
