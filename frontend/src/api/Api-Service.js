import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 3600
})

//요청 인터셉터 추가: 매 요청마다 토큰 확인 및 설정 ===
apiClient.interceptors.request.use(config => {
    // 1. 요청이 나가기 직전에 sessionStorage에서 최신 토큰을 다시 읽습니다.
    const token = sessionStorage.getItem("ACCESS_TOKEN");
    
    // 2. 토큰이 존재하면 Authorization 헤더를 동적으로 설정합니다.
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        // 토큰이 없으면 헤더를 제거하거나 설정하지 않습니다. (선택 사항)
        delete config.headers.Authorization;
    }

    return config;
}, error => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use(response => {
    // 응답이 성공(2xx)이면 그대로 반환
    return response
},
error => {
    const { response } = error
    if(response && response.status === 403) {
        console.error("인증 오류(401/403) 발생: 접근 권한이 없습니다. 다시 로그인해 주세요.");
        alert("111세션이 만료되었거나 접근 권한이 없습니다. 다시 로그인해 주세요.");
        window.location.href = "/auth/signin";

        // 리디렉션 후 요청 체인을 중단하기 위해 비표준적인 방식으로 요청 체인을 중단
        return new Promise(() => {});
    }
    return Promise.reject(error);
})

export default apiClient;