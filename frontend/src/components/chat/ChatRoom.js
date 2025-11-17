// src/components/ChatRoom.js

import React, { useState, useEffect, useRef } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import apiClient from "../../api/Api-Service";
import { formatFullDate } from "../utilities/DateUtiles"

const BG_COLOR = "#FFFFFF";
const TEXT_COLOR = "#000000";
const LIGHT_TEXT_COLOR = "#555555";
const HEADER_HEIGHT = "64px";

const ChatRoomWrapper = styled(Box)(({ theme }) => ({
  marginTop: HEADER_HEIGHT,
  backgroundColor: BG_COLOR,
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: 'center'
}));

const ChatContentContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  width: "90%",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    width: "100%",
  },
}));

const ChatArea = styled(Paper)(({ theme }) => ({
  flex: 3,
  minHeight: '600px',
  margin: theme.spacing(2),
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  borderRadius: (theme.shape?.borderRadius || 4) * 2,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  border: `1px solid ${TEXT_COLOR}`,
  backgroundColor: BG_COLOR,
}));

const UserListArea = styled(Paper)(({ theme }) => ({
  flex: 0.8,
  minHeight: '400px',
  margin: theme.spacing(2),
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  borderRadius: (theme.shape?.borderRadius || 4) * 2,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  border: `1px solid ${TEXT_COLOR}`,
  backgroundColor: BG_COLOR,
}));

const MessageBubble = styled(Box)(({ theme, isCurrentUser }) => ({
  maxWidth: "60%",
  marginLeft: isCurrentUser ? "auto" : '10px',
  marginRight: isCurrentUser ? '10px' : "auto",
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

const MessageListArea = styled(List)({
  flexGrow: 1,
  overflowY: "auto",
  paddingRight: "10px",
});

const MessageInputArea = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const ChatRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth(); // user.username 사용
  const ws = useRef(null);
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {

    // roomId와 username을 쿼리 파라미터로 전달
    console.log('roomId', roomId)

    const fetchCommunity = async () => {
      try {
      const response = await apiClient.get(`/chatroom/${roomId}`)
      const roomNameData = response.data.result.roomName
      setRoomName(roomNameData)
      const userData = response.data.result.usernameAndIsConnectedResponse;
      setUsers([...userData])
      } catch (error) {
        console.log('error', error)
      }
    }

    const socketUrl = `ws://localhost:8080/community?roomId=${roomId}&username=${user.username}`;
    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = async () => {
      console.log("WebSocket 연결 성공");
      fetchCommunity();
      try {
        const response = await apiClient.get(`/chatroom/text/${roomId}`)
        const messageData = response.data.result
        setMessages(messageData.map(message => ({
          ...message,
          isCurrentUser: message.username === user.username
      })))
      } catch (error) {
        console.log('error', error)
        console.log('error.response.data.message', error.response?.data?.message || '이전 대화를 불러오는 도중 오류가 발생했습니다.');
      }
    };

    ws.current.onmessage = (event) => {

      // 서버 메시지 형식: "username: message"
      const [sender, ...rest] = event.data.split(":");
      const text = rest.join(":").trim();

      const newMessage = {
        username: sender,
        text,
        createdDate: new Date(),
        isCurrentUser: sender === user.username,
      };

      setMessages((prev) => [...prev, newMessage]);
    };

    ws.current.onclose = () => {
      console.log("WebSocket 연결 종료");
      // navigate("/")
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [roomId, user]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    if (input.trim() === "") return;

    // 서버로 메시지 전송
    ws.current.send(input);

    setInput("");
  };

  return (
    <ChatRoomWrapper>
      <ChatContentContainer>
        <ChatArea elevation={0}>
          <Typography variant="h6" gutterBottom>
            채팅방 '{roomName}'
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
                  {formatFullDate(msg.createdDate)}
                </Typography>
              </MessageBubble>
            ))}
          </MessageListArea>

          <MessageInputArea component="form" onSubmit={sendMessage}>
            <TextField
              multiline
              minRows={3}
              maxRows={20}
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요"
              sx={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
            <Button
              variant="contained"
              type="submit"
              sx={{
                backgroundColor: TEXT_COLOR,
                color: BG_COLOR,
                minWidth: "100px",
                "&:hover": {
                  backgroundColor: LIGHT_TEXT_COLOR,
                  color: BG_COLOR,
                },
              }}
            >
              전송
            </Button>
          </MessageInputArea>
        </ChatArea>

        <UserListArea elevation={0}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            사용자 목록
          </Typography>
          <List>
            {users.map((user, idx) => (
              <React.Fragment key={idx}>
                <ListItem>
                  <ListItemText
                    primary={user.username}
                    secondary={user.connected ? "접속중" : "미접속중"}
                  />
                  <Chip
                    label={user.connected ? "ON" : "OFF"}
                    sx={{
                      backgroundColor: user.connected ? TEXT_COLOR : BG_COLOR,
                      color: user.connected ? BG_COLOR : TEXT_COLOR,
                      border: user.connected
                        ? "none"
                        : `1px solid ${TEXT_COLOR}`,
                    }}
                    size="small"
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </UserListArea>
      </ChatContentContainer>
    </ChatRoomWrapper>
  );
};

export default ChatRoom;
