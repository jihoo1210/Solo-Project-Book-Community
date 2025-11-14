// src/components/ChatRoom.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { useParams } from "react-router-dom";

// ✅ 게시글 파일들과 일관된 색상 및 상수 정의
const BG_COLOR = "#FFFFFF";
const TEXT_COLOR = "#000000";
const LIGHT_TEXT_COLOR = "#555555";
const HEADER_HEIGHT = "64px";

// 전체 Wrapper (채팅 영역을 수평 중앙 정렬)
const ChatRoomWrapper = styled(Box)(({ theme }) => ({
  marginTop: HEADER_HEIGHT,
  backgroundColor: BG_COLOR,
  height: `calc(100vh - ${HEADER_HEIGHT})`,
  display: "flex",
  flexDirection: "row",
  justifyContent: "center", // ✅ 3. 수평 중앙 정렬
  // font-family 제거됨
  [theme.breakpoints.down("sm")]: {
    // 모바일에서는 중앙 정렬 필요 없음
  },
}));

// ✅ 3. 채팅 영역과 사용자 목록을 감싸 90% 너비를 설정하는 컨테이너
const ChatContentContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  width: "90%", // ✅ 90% 너비 설정
  height: "100%",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    width: "100%", // 모바일에서는 100% 사용
  },
}));

// 채팅 영역 (PostsCard와 일관된 스타일 적용)
const ChatArea = styled(Paper)(({ theme }) => ({
  flex: 3,
  margin: theme.spacing(2),
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",

  // PostsCard 스타일 적용
  borderRadius: (theme.shape?.borderRadius || 4) * 2,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  border: `1px solid ${TEXT_COLOR}`,
  backgroundColor: BG_COLOR,

  [theme.breakpoints.down("sm")]: {
    flex: "none",
    height: "60vh",
  },
}));

// 사용자 목록 영역 (PostsCard와 일관된 스타일 적용)
const UserListArea = styled(Paper)(({ theme }) => ({
  flex: 0.8,
  margin: theme.spacing(2),
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",

  // PostsCard 스타일 적용
  borderRadius: (theme.shape?.borderRadius || 4) * 2,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  border: `1px solid ${TEXT_COLOR}`,
  backgroundColor: BG_COLOR,
}));

// 메시지 버블 스타일 (수정됨: 꼬리 크기 통일)
const MessageBubble = styled(Box)(({ theme, isCurrentUser }) => ({
  maxWidth: "90%",
  margin: "auto",
  padding: theme.spacing(1.5),
  border: isCurrentUser ? "none" : `1px solid ${TEXT_COLOR}`,
  borderRadius: "15px",
  marginBottom: theme.spacing(1.5),
  alignSelf: isCurrentUser ? "flex-end" : "flex-start",
  backgroundColor: isCurrentUser ? LIGHT_TEXT_COLOR : BG_COLOR,
  color: !isCurrentUser ? TEXT_COLOR : BG_COLOR,
  wordBreak: "break-word",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    width: 0,
    height: 0,
    border: "8px solid transparent",
    borderBottomColor: isCurrentUser ? LIGHT_TEXT_COLOR : TEXT_COLOR, // isCurrentUser가 아닐 땐 border 색상으로 설정
    borderTop: 0,
    borderRight: isCurrentUser ? "none" : "8px solid transparent", // ✅ isCurrentUser가 아닐 때 오른쪽 border 제거
    borderLeft: isCurrentUser ? "8px solid transparent" : "none", // ✅ 꼬리 크기를 8px로 통일
    right: isCurrentUser ? "-7px" : "auto",
    left: isCurrentUser ? "auto" : "-7px",
    transform: "translateY(50%)",
  },
}));

// 메시지 목록 영역 (이전과 동일)
const MessageListArea = styled(List)({
  flexGrow: 1,
  overflowY: "auto",
  paddingRight: "10px",
});

// 메시지 입력 영역 (이전과 동일)
const MessageInputArea = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const ChatRoom = () => {
  const { id } = useParams();
  const currentUsername = "Me";

  const [messages, setMessages] = useState([
    {
      id: 1,
      username: "UserA",
      text: "안녕하세요! 채팅 테스트 중입니다.",
      time: "14:00",
      isCurrentUser: false,
    },
    {
      id: 2,
      username: "Me",
      text: "네, 잘 됩니다. 디자인이 깔끔해졌네요!",
      time: "14:01",
      isCurrentUser: true,
    },
    {
      id: 3,
      username: "UserA",
      text: "다른 게시글들과 통일된 느낌이 좋네요.",
      time: "14:03",
      isCurrentUser: false,
    },
  ]);
  const [users, setUsers] = useState([
    { id: 101, name: "UserA", connected: true },
    { id: 102, name: "Me", connected: true },
    { id: 103, name: "UserC", connected: false },
    { id: 104, name: "UserD", connected: true },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    console.log(`ChatRoom ${id} 로딩 완료.`);
  }, [id]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const newMessage = {
      id: Date.now(),
      username: currentUsername,
      text: input,
      time: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isCurrentUser: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  return (
    <ChatRoomWrapper>
      <ChatContentContainer>
        {" "}
        {/* ✅ 3. 90% 너비 컨테이너 시작 */}
        {/* 좌측 채팅 영역 */}
        <ChatArea elevation={0}>
          <Typography variant="h6" gutterBottom>
            채팅방 {id}
          </Typography>
          <MessageListArea>
            {messages.map((msg, index) => (
              <MessageBubble key={index} isCurrentUser={msg.isCurrentUser}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontWeight: 600,
                    mb: 0.5,
                    color: msg.isCurrentUser
                      ? alpha(BG_COLOR, 0.8)
                      : alpha(TEXT_COLOR, 0.8),
                  }}
                >
                  {msg.username}
                </Typography>
                <Typography variant="body1">{msg.text}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "right",
                    mt: 0.5,
                    color: msg.isCurrentUser
                      ? alpha(BG_COLOR, 0.6)
                      : alpha(TEXT_COLOR, 0.6),
                    fontSize: "0.6rem",
                  }}
                >
                  {msg.time}
                </Typography>
              </MessageBubble>
            ))}
          </MessageListArea>

          {/* 메시지 입력 폼 */}
          <MessageInputArea component="form" onSubmit={sendMessage}>
            <TextField
              // fullWidth // 제거됨
              multiline // ✅ 1. 멀티라인 활성화
              minRows={3}
              maxRows={20} // ✅ 1. 세로 크기 증가
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요"
              sx={{ flex: 1 }} // ✅ TextField가 남은 공간을 차지하도록 설정
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // 기본 Enter 동작(줄바꿈) 방지
                  sendMessage(e); // 메시지 전송 함수 호출
                }
              }}
            />
            <Button
              variant="contained"
              type="submit"
              // color="primary" 속성 제거
              sx={{
                // ✅ 2. 버튼 색상 변경 (활성화: TEXT_COLOR 배경, BG_COLOR 텍스트)
                backgroundColor: TEXT_COLOR,
                color: BG_COLOR,
                height: "100%", // 텍스트 필드 높이에 맞추기 위해 높이 100% 설정
                minWidth: "100px", // ✅ 버튼 최소 너비 증가
                "&:hover": {
                  backgroundColor: LIGHT_TEXT_COLOR, // ✅ 2. 활성화 hover: LIGHT_TEXT_COLOR
                  color: BG_COLOR,
                },
                // ✅ 2. 비활성화 상태 (BG_COLOR 배경으로 변경)
                "&.Mui-disabled": {
                  backgroundColor: BG_COLOR,
                  color: alpha(TEXT_COLOR, 0.5), // 비활성화 텍스트 색상
                },
              }}
            >
              전송
            </Button>
          </MessageInputArea>
        </ChatArea>
        {/* 우측 사용자 목록 */}
        <UserListArea elevation={0}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            사용자 목록
          </Typography>
          <List>
            {users.map((user, idx) => (
              <React.Fragment key={idx}>
                <ListItem>
                  <ListItemText
                    primary={user.name}
                    secondary={user.connected ? "접속중" : "미접속중"}
                  />
                  <Chip
                    label={user.connected ? "ON" : "OFF"}
                    color="default"
                    sx={{
                      // ✅ sx 속성으로 배경색과 글자색을 직접 지정
                      backgroundColor: user.connected ? TEXT_COLOR : BG_COLOR,
                      color: user.connected ? BG_COLOR : TEXT_COLOR,
                      border: user.connected
                        ? "none"
                        : `1px solid ${TEXT_COLOR}`, // 미접속 시 경계선 추가
                    }}
                    size="small"
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </UserListArea>
      </ChatContentContainer>{" "}
      {/* ✅ 3. 90% 너비 컨테이너 끝 */}
    </ChatRoomWrapper>
  );
};

export default ChatRoom;
