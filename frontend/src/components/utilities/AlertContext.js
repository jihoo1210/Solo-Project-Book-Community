import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // AlertProvider.js의 핵심 기능 추가
import apiClient from '../../api/Api-Service';
import { useAuth } from '../auth/AuthContext';

// 1. Context 생성
const AlertContext = createContext();

// 2. Custom Hook 생성: 다른 컴포넌트에서 Context에 쉽게 접근할 수 있도록 합니다.
export const useAlert = () => {
  return useContext(AlertContext);
};

// 3. Provider 컴포넌트: 상태를 관리하고 하위 컴포넌트에 제공합니다.
// 이름은 AlertProvider가 아닌, 이 파일의 이름을 따서 AlertProvider로 명명합니다.
// 기존 AlertProvider의 로직(useLocation, useEffect)이 이 컴포넌트 내부로 이동합니다.
export const AlertProvider = ({ children }) => {
  // 알림 상태 (새 알림 유무, 초기값은 false)
  const [ haveNewAlert, setHaveNewAlert ] = useState(false);
  const { user } = useAuth();
  
  const location = useLocation();

  // API 호출 함수: useCallback으로 메모이제이션
  const checkNewAlertAPI = useCallback(async () => {
    console.log("API: Checking for new alerts...");
    if(user != null) {
      try {
        const response = await apiClient.get("/alert/check-new-alert");
        const haveNew = response.data.result.haveNew;
        setHaveNewAlert(haveNew);

        // console.log(`API 결과: New alert status = ${haveNew}`);

        return haveNew; // API 호출 결과를 반환
      } catch (error) {
        console.error("알림 내역을 불러오는데 오류가 발생했습니다.", error);
        alert(error.response.data.message || "알림 내역을 불러오는데 오류가 발생했습니다.");
        setHaveNewAlert(false); // 오류 발생 시 알림 없음으로 처리
      }
  }
  }, [user]); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 생성

  // 경로 변경 감지 및 알림 체크 로직 (AlertProvider.js의 핵심 useEffect)
  // location 또는 checkNewAlertAPI가 변경될 때마다 실행됩니다.
  useEffect(() => {
    // API 호출 전용 함수를 실행하여 알림 상태를 업데이트합니다.
    checkNewAlertAPI();

    // const timestamp = new Date().toLocaleTimeString();
    // console.log(`[AlertProvider] 경로 변경 감지 및 알림 체크: ${timestamp}. 현재 경로: ${location.pathname}`);
    
  }, [location, checkNewAlertAPI]); // location이 변경될 때마다 알림 체크

  // Provider의 value는 상태와 상태를 업데이트하는 함수를 포함합니다.
  const value = {
    haveNewAlert,
    setHaveNewAlert,
    checkNewAlertAPI, // 알림을 수동으로 확인해야 할 때를 대비해 함수 노출
  };

  // Provider 컴포넌트가 Context를 제공합니다.
  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};