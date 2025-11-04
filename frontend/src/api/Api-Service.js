import axios from 'axios'

const token = sessionStorage.getItem("ACCESS_TOKEN")

const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 3600
})

// 토큰이 있다면 모든 요청 헤더에 Authorization 추가
if(token) apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`

apiClient.interceptors.response.use(response => {
    // 응답이 성공(2xx)이면 그대로 반환
    return response
},
error => {
    const { response } = error
    alert(response.status)
    if(response && response.status === 403) {
        console.error("인증 오류(401/403) 발생: 접근 권한이 없습니다. 다시 로그인해 주세요.");
        alert("세션이 만료되었거나 접근 권한이 없습니다. 다시 로그인해 주세요.");
        window.location.href = "/auth/signin";

        // 리디렉션 후 요청 체인을 중단하기 위해 비표준적인 방식으로 요청 체인을 중단
        return new Promise(() => {});
    }
    return Promise.reject(error);
})

export default apiClient;