import apiClient from '../../api/Api-Service';

// Presigned PUT URL 발급
export async function getPresignedUpload(filename, contentType) {
  const res = await apiClient.post('/files/presign-upload', null, {
    params: { filename, contentType },
  });
  return res.data.result
}

// Presigned GET URL 발급
export async function getFileUrl(key) {
  const res = await apiClient.get('/files/url', {
    params: { key },
  });
  return res.data.result
}

// 단일 파일 삭제
export async function deleteFile(key) {
  const res = await apiClient.delete('/files', {
    params: { key },
  });
  console.log('삭제됨: ' + key)
  return res.data.result
}

// 여러 파일 삭제
export async function deleteFiles(keys = []) {
  return Promise.all(keys.map((k) => deleteFile(k)));
}