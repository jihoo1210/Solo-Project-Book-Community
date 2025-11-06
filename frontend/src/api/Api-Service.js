import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 3600,
    withCredentials: true
})

apiClient.interceptors.response.use(response => {
    // 응답이 성공(2xx)이면 그대로 반환
    return response
},
error => {
    const { response } = error
    if(response && (response.status === 401 || response.status === 403)) {
        alert(error)
        console.log('error :>> ', error);
        window.location.href = "/auth/signin";

        // 리디렉션 후 요청 체인을 중단하기 위해 비표준적인 방식으로 요청 체인을 중단
        return new Promise(() => {});
    }
    return Promise.reject(error);
})

export default apiClient;