import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiClient from '../../api/Api-Service';

// Context 생성
const AuthContext = createContext(null);

// Context Provider 컴포넌트
export const AuthProvider = ({ children }) => {
    // 인증 상태 및 사용자 정보 상태
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null); 
    // 추가: 초기 로딩 상태 (인증 상태 확인 중)
    const [authLoading, setAuthLoading] = useState(true); 

    // 추가: 서버에 현재 인증 상태(쿠키 유효성)를 확인하는 함수
    // 페이지가 새로고침될 때 username을 다시 가져와서 오류 방지
    const fetchCurrentUser = useCallback(async () => {
        try {
            // HttpOnly 쿠키는 자동으로 전송되며, 서버가 유효성을 검사합니다.
            const response = await apiClient.get('/auth/me'); 
            
            // 응답 본문에서 사용자 이름만 가져옵니다. 
            // 💡 삭제: savedInAlert 값 제거
            const { username, role } = response.data.result; 

            console.log('username: ', username);
            // 💡 삭제: console.log('savedInAlert', savedInAlert) 제거
            
            setIsLoggedIn(true);
            setUser({ username, role });
            // 💡 삭제: 알림 상태 저장 로직 제거
            // setIsExistsAlert(savedInAlert);
            
        } catch (error) {
            // 401/403 등 에러가 발생하면 쿠키가 유효하지 않다는 의미
            setIsLoggedIn(false);
            setUser(null);
            // 💡 삭제: 에러 시 알림 상태 초기화 로직 제거
            // setIsExistsAlert(false);
        } finally {
            setAuthLoading(false);
        }
    }, []); // useCallback 사용: 이 함수는 한 번만 생성되어야 합니다.

    useEffect(() => {
        // 서버에 인증 상태를 요청하여 초기 상태를 설정합니다.
        fetchCurrentUser();
        console.log('fetchCurrentUser 실행됨')        
    }, [fetchCurrentUser]); // useCallback으로 인해 fetchCurrentUser가 변경되지 않으므로 무한 루프 위험 없음

    // 로그인 처리 함수: 서버 로그인 API 호출 후 응답 본문에서 사용자 이름만 저장
    const login = (username, role) => {
        // 백엔드 로그인 API(/auth/signin) 호출 후 성공 시,
        // 백엔드에서 응답 본문에 담아준 사용자 이름(username)만 프론트 상태에 저장합니다.
        setIsLoggedIn(true);
        // user.username에 저장
        setUser({ username, role });
        // 💡 삭제: savedInAlert 관련 주석 및 로직 제거
    };

    // 로그아웃 처리 함수: 서버에 쿠키 삭제 요청을 보낸 후 상태 초기화
    const logout = async () => {
        try {
            // 수정: 서버에 로그아웃 요청을 보내 쿠키를 만료시킵니다.
            await apiClient.post("/auth/logout"); 
            
            setIsLoggedIn(false);
            setUser(null);
            // 💡 삭제: 알림 상태 초기화 로직 제거
            // setIsExistsAlert(false); 
            alert('로그아웃 되었습니다.')
            window.location.reload();
            
        } catch (error) {
            console.error("로그아웃 중 오류 발생:", error);
            // 에러가 나도 로컬 상태는 초기화하는 것이 일반적
            setIsLoggedIn(false);
            setUser(null);
            // 💡 삭제: 알림 상태 초기화 로직 제거
            // setIsExistsAlert(false);
            window.location.reload();
        }
    };
    
    // authLoading 상태를 Context에 추가하여 로딩 중일 때 UI를 처리할 수 있게 합니다.
    const contextValue = { 
        isLoggedIn, 
        user, 
        login, 
        logout,
        authLoading,
    };

    // Context Value 제공
    return (
        <AuthContext.Provider value={contextValue}>
            {/* 로딩 중이면 로딩 컴포넌트를 보여주고, 완료되면 children을 렌더링 */}
            {authLoading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};

// Context 사용을 위한 커스텀 훅
export const useAuth = () => {
    return useContext(AuthContext);
};