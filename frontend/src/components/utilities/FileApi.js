// src/utilities/fileApi.js
import apiClient from '../../api/Api-Service';

// Presigned PUT URL 발급
export async function getPresignedUpload(filename, contentType) {
  const res = await apiClient.post('/api/files/presign-upload', null, {
    params: { filename, contentType },
  });
  // ResponseController.success 형태를 고려하면 res.data.result에 담길 수 있음
  return res.data.result ?? res.data;
}

// Presigned GET URL 발급
export async function getFileUrl(key) {
  const res = await apiClient.get('/api/files/url', {
    params: { key },
  });
  return res.data.result ?? res.data;
}

// 단일 파일 삭제
export async function deleteFile(key) {
  const res = await apiClient.delete('/api/files', {
    params: { key },
  });
  console.log('삭제됨: ' + key)
  return res.data.result ?? res.data;
}

// 여러 파일 삭제
export async function deleteFiles(keys = []) {
  return Promise.all(keys.map((k) => deleteFile(k)));
}