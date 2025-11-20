package com.example.backend.service;

import com.example.backend.dto.chat.text.ChatRoomTextResponse;
import com.example.backend.entity.ChatRoom;
import com.example.backend.entity.ChatRoomText;
import com.example.backend.entity.User;
import com.example.backend.repository.ChatRoomRepository;
import com.example.backend.repository.ChatRoomTextRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.TextMessage;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class ChatRoomTextService {

    private final ChatRoomTextRepository chatRoomTextRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    /**
     * 채팅방의 이전 25개의 메시지 가져오는 메서드
     * @param roomId 가져올 채팅방
     * @return 25개의 메시지
     */
    public List<ChatRoomTextResponse> getMessage(Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElseThrow(() -> new IllegalArgumentException("해당 커뮤니티가 존재하지 않습니다."));
        List<ChatRoomText> chatRoomTextList = chatRoomTextRepository.findTop25ByRoom(chatRoom);

        return chatRoomTextList.stream().map(item -> ChatRoomTextResponse.builder()
                .username(item.getWriter().getUsername())
                .text(item.getText())
                .createdDate(item.getCreatedDate())
                .build()).toList();
    }

    /**
     * 메시지 전송할 때 데이터베이스에 저장하는 메서드
     * @param roomId 채팅방 ID
     * @param username 작성자
     * @param message 내용
     * @return 문자열로 변환된 내용
     */
    @Transactional
    public String createMessage(Long roomId, String username, TextMessage message) {

        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> new IllegalArgumentException("해당 커뮤니티가 존재하지 않습니다."));
        User writer = userRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));
        String messageStr = message.getPayload();

        ChatRoomText target = ChatRoomText.builder()
                .room(room)
                .writer(writer)
                .text(messageStr)
                .build();
        chatRoomTextRepository.save(target);

        return messageStr;
    }
}
