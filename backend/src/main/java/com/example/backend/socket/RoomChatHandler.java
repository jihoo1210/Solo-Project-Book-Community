package com.example.backend.socket;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@Component
public class RoomChatHandler extends TextWebSocketHandler {
    private final RoomRepository roomRepository;
    private final Map<WebSocketSession, String> sessionRoomMap = new HashMap<>();
    private final Map<WebSocketSession, String> sessionUserMap = new HashMap<>();

    /**
     * 웹소켓 연결이 성공적으로 수립되었을 때 호출
     * @param session
     * @throws Exception
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String roomId = getParam(session, "roomId");
        String userId = getParam(session, "userId");

        ChatRoom room = roomRepository.getRoom(roomId);
        if(room != null && room.isInvited(userId)) {
            room.addConnectUser(userId);
            sessionRoomMap.put(session, roomId);
            sessionUserMap.put(session, userId);
        } else {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("승인되지 않은 사용자입니다."));
        }
    }

    /**
     * 웹소켓 연결을 통해 클라이언트로부터 텍스트 메시지를 수신했을 때
     * @param session
     * @param message
     * @throws Exception
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String roomId = sessionRoomMap.get(session);
        if(roomId != null) {
            for (WebSocketSession s : sessionRoomMap.keySet()) {
                // 동일한 세션 검색
                if(roomId.equals(sessionRoomMap.get(s)) && s.isOpen()) {
                    // 세션에 메시지 보내기
                    s.sendMessage(new TextMessage(sessionUserMap.get(session) + ": " + message.getPayload()));
                }
            }
        }
    }

    /**
     * 클라이언트와의 웹소켓 연결이 종료된 후 호출
     * @param session
     * @param status
     * @throws Exception
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String roomId = sessionRoomMap.remove(session);
        String userId = sessionUserMap.remove(session);
        if (roomId != null && userId != null) {
            ChatRoom room = roomRepository.getRoom(roomId);
            if(room != null) {
                room.removeConnectUser(userId);
            }
        }
    }

    private String getParam(WebSocketSession session, String key) {
        if(session.getUri() == null) return null;
        return UriComponentsBuilder.fromUri(session.getUri())
                .build()
                .getQueryParams()
                .getFirst(key);
    }
}
