// src/constants/theme.js

import { createTheme } from "@mui/material";

// 기본 테마 색상
export const BG_COLOR = '#FFFFFF';
export const TEXT_COLOR = '#000000';
export const LIGHT_TEXT_COLOR = '#555555';
export const HEADER_HEIGHT = '64px';

// 공통 액션/상태 색상
export const RED_COLOR = '#F44336';
export const PURPLE_COLOR = '#9c27b0';
export const DARK_PURPLE_COLOR = '#6a1b9a'; 
export const MODIFIED_COLOR = '#FFC107'; 
export const VIEW_SAVED_COLOR = '#8B4513'; 

// 게시글/댓글 채택 색상
export const AQUA_BLUE = '#00BCD4'; 
export const DARK_AQUA_BLUE = '#0097A7';

// 새 알림/새 게시글 배경 색상
export const NEW_COLOR = '#4CAF50'; 
export const READ_COLOR = LIGHT_TEXT_COLOR; // 읽은 알림 색상

// 알림 유형 색상
export const COMMENT_COLOR = '#666'; 
export const ADOPT_COLOR = AQUA_BLUE; 
export const POST_COLOR = PURPLE_COLOR; 
export const LIKE_COLOR = RED_COLOR;
export const APPLICATION_COLOR = '#00a8cc'; // 신청 관련 색상

// 승인/거절 관련 색상
export const APPROVE_COLOR = '#4CAF50'; // 녹색 계열 (승인)
export const REJECT_COLOR = '#FF5722'; // 주황/붉은 계열 (거절)

// 모집 신청 관련 색상
export const RECRUIT_ACCENT_COLOR = '#00a8cc';
export const RECRUIT_DARK_COLOR = '#008c99';
export const RECRUIT_LIGHT_BG = '#e6f9ff';

export const RECRUIT_APPROVE_COLOR = '#1B5E20'

// 폰트 디자인
const theme = createTheme({
  typography: {
    fontFamily: '"Noto Sans KR","Arial",sans-serif',
  },
});

export default theme;