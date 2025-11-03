import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Context 생성
const AuthContext = createContext(null);

// 2. Context Provider 컴포넌트
export const AuthProvider = ({ children }) => {
    // 토큰의 존재 여부와 사용자 정보를 저장할 상태
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null); // 사용자 이름 등을 저장할 상태

    // 3. 페이지 로드 시 또는 상태 변화 시 토큰 확인
    useEffect(() => {
        const token = sessionStorage.getItem("ACCESS_TOKEN");
        if (token) {
            // 토큰이 있다면 로그인 상태로 설정
            setIsLoggedIn(true);
            // 실제 앱에서는 토큰을 디코딩하거나 서버에 요청하여 사용자 정보를 가져와야 합니다.
            // 여기서는 임시로 '사용자명'으로 설정
            setUser({ username: '사용자명' });
        } else {
            // 토큰이 없다면 로그아웃 상태로 설정
            setIsLoggedIn(false);
            setUser(null);
        }
    }, []);

    // 4. 로그인/로그아웃 함수
    const login = (username = '사용자명') => {
        if(sessionStorage.getItem("ACCESS_TOKEN")) {
            setIsLoggedIn(true);
            setUser({ username });
        } else {
            alert("token is not exists")
        }
    };

    const logout = () => {
        sessionStorage.removeItem("ACCESS_TOKEN");
        setIsLoggedIn(false);
        setUser(null);
        alert('로그아웃 되었습니다.')
        window.location.href = '/'
    };

    // 5. Context Value 제공
    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 6. Context 사용을 위한 커스텀 훅
export const useAuth = () => {
    return useContext(AuthContext);
};