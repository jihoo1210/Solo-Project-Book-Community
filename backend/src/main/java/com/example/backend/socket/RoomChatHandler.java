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

    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomTextService chatRoomTextService;

    // 세션별 매핑
    private final Map<WebSocketSession, Long> sessionRoomMap = new HashMap<>();
    private final Map<WebSocketSession, String> sessionUserMap = new HashMap<>();

    // 방별 접속자 관리 (메모리)
    private final Map<Long, Set<String>> roomConnectedUsersMap = new HashMap<>();

    /**
     * 사용자가 세션에 접속할 때 실행되는 메서드
     * 초대된 회원 또는 관리자인지 검사하고
     * 접속중인 사용자에 파라미터로 받은 회원명을 저장한다
     * @param session
     * @throws Exception
     */
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

    /**
     * 사용자가 메시지 전송 요청을 받았을 때 처리하는 메서드
     * 해당하는 세션에 메시지를 전송한다
     * 데이터베이스에 메시지를 저장한다
     * @param session
     * @param message
     * @throws Exception
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Long roomId = sessionRoomMap.get(session);
        String username = sessionUserMap.get(session);

        if (roomId != null && username != null) {
            for (WebSocketSession s : sessionRoomMap.keySet()) { // 현재 sessionMap에 존재하는 session들을 순회하고 반환한다
                if (roomId.equals(sessionRoomMap.get(s)) && s.isOpen()) { // 반환된 session으로 roomId를 검색한 후 일치 여부 검사 && 해당 세션이 열려 있는지 확인
                    chatRoomTextService.createMessage(roomId, username, message); // 데이터베이스에 메시지 저장
                    s.sendMessage(new TextMessage(username + ": " + message.getPayload()));
                }
            }
        }
    }

    /**
     * 회원과 세션의 연결 정보가 끊어졌을 때 실행되는 메서드
     * 세션 Map에서 현재 회원과 연결되어 있던 세션을 제거한다
     * 접속중인 회원 Map에서 현재 회원을 제거한다
     * @param session
     * @param status
     * @throws Exception
     */
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

    /**
     * 파라미터에서 key를 통해 값을 얻는 메서드
     * @param session
     * @param key 얻을 값의 key
     * @return
     */
    private String getParam(WebSocketSession session, String key) {
        if(session.getUri() == null) return null;
        return UriComponentsBuilder.fromUri(session.getUri())
                .build()
                .getQueryParams()
                .getFirst(key);
    }

    /**
     * 현재 접속중인 회원 수를 조회하는 메서드
     * @param roomId 조회할 채팅방 ID
     * @return 접속중인 회원 수
     */
    public int getConnectedUserCount(Long roomId) {
        return roomConnectedUsersMap.getOrDefault(roomId, Collections.emptySet()).size();
    }

    /**
     * 회원이 접속중인지 확인하는 메서드
     * @param roomId 확인할 회원이 속한 채팅방 ID
     * @param username 확인할 회원
     * @return 접속 여부 boolean 값
     */
    public boolean isConnected(Long roomId, String username) {
        return roomConnectedUsersMap.getOrDefault(roomId, Collections.emptySet()).contains(username);
    }
}
