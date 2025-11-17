package com.example.backend.socket;

import com.example.backend.entity.ChatRoom;
import com.example.backend.entity.User;
import com.example.backend.repository.ChatRoomRepository;
import com.example.backend.service.ChatRoomTextService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@RequiredArgsConstructor
@Component
public class RoomChatHandler extends TextWebSocketHandler {

//    private final ChatRoomService chatRoomService;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomTextService chatRoomTextService;

    // 세션별 매핑
    private final Map<WebSocketSession, Long> sessionRoomMap = new HashMap<>();
    private final Map<WebSocketSession, String> sessionUserMap = new HashMap<>();

    // 방별 접속자 관리 (메모리)
    private final Map<Long, Set<String>> roomConnectedUsersMap = new HashMap<>();

    @Transactional
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String roomIdStr = getParam(session, "roomId");
        String username = getParam(session, "username");

        if (roomIdStr == null || username == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("roomId와 username가 필요합니다."));
            return;
        }

        Long roomId = Long.valueOf(roomIdStr);
        ChatRoom room =  chatRoomRepository.findById(roomId).orElse(null);

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
            sessionRoomMap.put(session, roomId);
            sessionUserMap.put(session, username);

            // 메모리에서 접속자 관리
            roomConnectedUsersMap.putIfAbsent(roomId, new HashSet<>());
            roomConnectedUsersMap.get(roomId).add(username);

        } else {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("초대된 사용자만 접속 가능합니다."));
        }
    }

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

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long roomId = sessionRoomMap.remove(session);
        String username = sessionUserMap.remove(session);

        if (roomId != null && username != null) {
            if (roomConnectedUsersMap.containsKey(roomId)) {
                roomConnectedUsersMap.get(roomId).remove(username);
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

    // 방별 접속자 수 조회용 메서드
    public int getConnectedUserCount(Long roomId) {
        return roomConnectedUsersMap.getOrDefault(roomId, Collections.emptySet()).size();
    }

    public Set<String> getConnectedUsers(Long roomId) {
        return roomConnectedUsersMap.getOrDefault(roomId, Collections.emptySet());
    }

    public boolean isConnected(Long roomId, String username) {
        return roomConnectedUsersMap.getOrDefault(roomId, Collections.emptySet()).contains(username);
    }
}
