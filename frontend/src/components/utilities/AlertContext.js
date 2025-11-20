import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../../api/Api-Service';
import { useAuth } from '../auth/AuthContext';

// 1. Context 생성
const AlertContext = createContext();

// 2. Custom Hook 생성: 다른 컴포넌트에서 Context에 쉽게 접근할 수 있도록 합니다.
export const useAlert = () => {
  return useContext(AlertContext);
};

// 3. Provider 컴포넌트: 상태를 관리하고 하위 컴포넌트에 제공합니다.
export const AlertProvider = ({ children }) => {
  // 알림 상태 (새 알림 유무, 초기값은 false)
  const [ haveNewAlert, setHaveNewAlert ] = useState(false);
  const { user } = useAuth();
  
  const location = useLocation();

  // API 호출 함수: useCallback으로 메모이제이션
  const checkNewAlertAPI = useCallback(async () => {
    if(user != null) {
      try {
        const response = await apiClient.get("/alert/check-new-alert");
        const haveNew = response.data.result.haveNew;
        setHaveNewAlert(haveNew);

        return haveNew; // API 호출 결과를 반환
      } catch (error) {
        console.error("알림 내역을 불러오는데 오류가 발생했습니다.", error);
        alert(error.response.data.message || "알림 내역을 불러오는데 오류가 발생했습니다.");
        setHaveNewAlert(false); // 오류 발생 시 알림 없음으로 처리
      }
  }
  }, [user]);

  // 경로 변경 감지 및 알림 체크 로직
  useEffect(() => {
    checkNewAlertAPI();
    
  }, [location, checkNewAlertAPI]); // location이 변경될 때마다 알림 체크

  // Provider의 value는 상태와 상태를 업데이트하는 함수를 포함합니다.
  const value = {
    haveNewAlert,
    setHaveNewAlert,
    checkNewAlertAPI,
  };

  // Provider 컴포넌트가 Context를 제공합니다.
  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};