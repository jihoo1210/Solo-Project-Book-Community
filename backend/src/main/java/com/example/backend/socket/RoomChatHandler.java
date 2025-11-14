package com.example.backend.socket;

import com.example.backend.entity.ChatRoom;
import com.example.backend.entity.User;
import com.example.backend.service.ChatRoomService;
import com.example.backend.service.ChatRoomTextService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@Component
public class RoomChatHandler extends TextWebSocketHandler {

    private final ChatRoomService chatRoomService;
    private final ChatRoomTextService chatRoomTextService;
    private final Map<WebSocketSession, Long> sessionRoomMap = new HashMap<>();
    private final Map<WebSocketSession, String> sessionUserMap = new HashMap<>();

    /**
     * 클라이언트로부터 웹소켓 연결이 성공적으로 수립된 후 호출되는 메서드입니다.
     * @param session
     * @throws Exception
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String roomIdStr = getParam(session, "roomId");
        String username = getParam(session, "username");

        if (roomIdStr == null || username == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("roomId와 username가 필요합니다."));
            return;
        }

        Long roomId = Long.valueOf(roomIdStr);
        ChatRoom room = chatRoomService.getRoom(roomId);

        // 사용자가 초대된 사용자인지 확인 및 User 객체 찾기
        User connectingUser = null;
        if (room != null) {
            if(username.equals(room.getCreator().getUsername())) {
                connectingUser = room.getCreator();
            } else {
                connectingUser = room.getInvitedUsers().stream()
                        .filter(u -> u.getUsername().equals(username))
                        .findFirst()
                        .orElse(null);
            }
        }

        if (connectingUser != null) {
            if (room.getConnectedUsers() == null) {
                // @Transient 필드 초기화 (DB에 저장되지 않고 인메모리에서 관리)
                room.setConnectedUsers(new ArrayList<>());
            }
            room.getConnectedUsers().add(connectingUser);

            sessionRoomMap.put(session, roomId);
            sessionUserMap.put(session, username);
            System.out.println("사용자 " + username + "이(가) 방 " + roomId + "에 접속했습니다.");
        } else {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("초대된 사용자만 접속 가능합니다."));
        }
    }

    /**
     * 웹소켓 연결을 통해 클라이언트로부터 텍스트 메시지를 수신했을 때 호출되는 메서드입니다.
     * @param session
     * @param message
     * @throws Exception
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Long roomId = sessionRoomMap.get(session);
        String username = sessionUserMap.get(session);

        if (roomId != null && username != null) {
            for (WebSocketSession s : sessionRoomMap.keySet()) {
                if (roomId.equals(sessionRoomMap.get(s)) && s.isOpen()) {
                    chatRoomTextService.createMessage(roomId, username, message);
                    s.sendMessage(new TextMessage(username + ": " + message.getPayload()));
                }
            }
        }
    }

    /**
     * 클라이언트와의 웹소켓 연결이 종료된 후 호출되는 메서드입니다 (정상 종료든 비정상 종료든).
     * @param session
     * @param status
     * @throws Exception
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long roomId = sessionRoomMap.remove(session);
        String username = sessionUserMap.remove(session);

        if (roomId != null && username != null) {
            ChatRoom room = chatRoomService.getRoom(roomId);
            if (room != null) {
                // 연결된 사용자 목록에서 제거
                if (room.getConnectedUsers() != null) {
                    room.getConnectedUsers().removeIf(u -> u.getUsername().equals(username));
                }
            }
            System.out.println("사용자 " + username + "이(가) 방 " + roomId + "에서 나갔습니다.");
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
