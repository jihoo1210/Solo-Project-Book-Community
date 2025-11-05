import React, { createContext, useState, useEffect, useContext } from 'react';

// Context 생성
const AuthContext = createContext(null);

// Context Provider 컴포넌트
export const AuthProvider = ({ children }) => {
    // 인증 상태 및 사용자 정보 상태
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null); 

    // 페이지 로드 시 토큰 확인 및 상태 설정
    useEffect(() => {
        const token = sessionStorage.getItem("ACCESS_TOKEN");
        const storedUsername = sessionStorage.getItem("USERNAME");
        if (token) {
            setIsLoggedIn(true);
            setUser({ username: storedUsername });
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
    }, []);

    // 로그인 처리 함수: 토큰이 세션에 있을 경우 로그인 상태로 설정
    const login = (username = '사용자명') => {
        if(sessionStorage.getItem("ACCESS_TOKEN")) {
            sessionStorage.setItem("USERNAME", username);
            setIsLoggedIn(true);
            setUser({ username });
        } else {
            alert("token is not exists")
        }
    };

    // 로그아웃 처리 함수: 토큰 삭제 및 상태 초기화
    const logout = () => {
        sessionStorage.removeItem("ACCESS_TOKEN");
        sessionStorage.removeItem("USERNAME");
        setIsLoggedIn(false);
        setUser(null);
        alert('로그아웃 되었습니다.')
        window.location.reload();
    };

    // Context Value 제공
    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Context 사용을 위한 커스텀 훅
export const useAuth = () => {
    return useContext(AuthContext);
};