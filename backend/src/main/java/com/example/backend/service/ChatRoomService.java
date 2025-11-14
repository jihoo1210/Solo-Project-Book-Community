package com.example.backend.service;

import com.example.backend.entity.ChatRoom;
import com.example.backend.entity.User;
import com.example.backend.repository.ChatRoomRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    /**
     * 웹소켓 생성
     * @param roomName 생성할 웹소켓 이름
     * @param creator 웹소켓 생성자
     * @param invitedUserIds 초대할 생성자
     * @return 생성된 웹소켓(room)
     */
    public ChatRoom createRoom(String roomName, User creator, List<Long> invitedUserIds) {
        List<User> invitedUsers = userRepository.findAllById(invitedUserIds);

        ChatRoom room = ChatRoom.builder()
                .roomName(roomName)
                .creator(creator)
                .invitedUsers(invitedUsers)
                .build();

        return chatRoomRepository.save(room);
    }

    public ChatRoom inviteUser(Long roomId, List<Long> invitedUserIds) {
        List<User> invitedUsers = userRepository.findAllById(invitedUserIds);
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElseThrow(() -> new IllegalArgumentException("해당 커뮤니티가 존재하지 않습니다."));

        invitedUsers.forEach(user -> {
            if(chatRoom.getCurrentUserNumber() < chatRoom.getMaxUserNumber()) {
                if(chatRoom.getInvitedUsers().contains(user)) {
                    throw new IllegalArgumentException("이미 초대된 사용자 입니다.");
                }
                chatRoom.getInvitedUsers().add(user);
                chatRoom.setCurrentUserNumber(chatRoom.getCurrentUserNumber() + 1);
            } else {
                throw new IllegalArgumentException("최대 회원수보다 더 많은 회원이 초대될 수 없습니다.");
            }
        });

        return chatRoom;
    }

    public ChatRoom getRoom(Long roomId) {
        return chatRoomRepository.findById(roomId).orElse(null);
    }
}
