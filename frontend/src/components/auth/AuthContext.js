import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiClient from '../../api/Api-Service';

// Context 생성
const AuthContext = createContext(null);

// Context Provider 컴포넌트
export const AuthProvider = ({ children }) => {
    // 인증 상태 및 사용자 정보 상태
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null); 
    const [authLoading, setAuthLoading] = useState(true); 

    // 서버에 현재 인증 상태(쿠키 유효성)를 확인하는 함수
    // 페이지가 새로고침될 때 username을 다시 가져와서 오류 방지
    const fetchCurrentUser = useCallback(async () => {
        try {
            // HttpOnly 쿠키는 자동으로 전송되며, 서버가 유효성을 검사합니다.
            const response = await apiClient.get('/auth/me'); 
            
            // 응답 본문에서 사용자 이름만 가져옵니다. 
            const { username, role } = response.data.result; 

            console.log('username: ', username);
            
            setIsLoggedIn(true);
            setUser({ username, role });
            
        } catch (error) {
            // 401/403
            setIsLoggedIn(false);
            setUser(null);
        } finally {
            setAuthLoading(false);
        }
    }, []); // useCallback 사용: 이 함수는 한 번만 생성되어야 합니다.

    useEffect(() => {
        // 서버에 인증 상태를 요청하여 초기 상태를 설정합니다.
        fetchCurrentUser();
        console.log('fetchCurrentUser 실행됨')        
    }, [fetchCurrentUser]);

    // 로그인 처리 함수: 서버 로그인 API 호출 후 응답 본문에서 사용자 이름과 권한 저장
    const login = (username, role) => {
        setIsLoggedIn(true);
        setUser({ username, role });
    };

    // 로그아웃 처리 함수: 서버에 쿠키 삭제 요청을 보낸 후 상태 초기화
    const logout = async () => {
        try {
            await apiClient.post("/auth/logout"); 
            
            setIsLoggedIn(false);
            setUser(null);
            alert('로그아웃 되었습니다.')
            window.location.reload();
            
        } catch (error) {
            console.error("로그아웃 중 오류 발생:", error);
            setIsLoggedIn(false);
            setUser(null);
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