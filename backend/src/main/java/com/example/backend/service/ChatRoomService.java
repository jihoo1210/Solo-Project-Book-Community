package com.example.backend.service;

import com.example.backend.dto.chat.ChatRoomIndexResponse;
import com.example.backend.dto.chat.ChatRoomShowResponse;
import com.example.backend.dto.chat.UsernameAndIsConnectedResponse;
import com.example.backend.entity.ChatRoom;
import com.example.backend.entity.Posts;
import com.example.backend.entity.User;
import com.example.backend.repository.ChatRoomRepository;
import com.example.backend.repository.PostsRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.searchSpec.ChatRoomSpec;
import com.example.backend.socket.RoomChatHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final PostsRepository postsRepository;
    private final RoomChatHandler roomChatHandler;

    /**
     * 웹소켓 생성
     * @param roomName 생성할 웹소켓 이름
     * @param creator 웹소켓 생성자
     * @return 생성된 웹소켓(room)
     */
    @Transactional
    public ChatRoom createRoom(String roomName, User creator, Integer maxUserNumber, Posts targetPosts) {
        Posts posts = postsRepository.findById(targetPosts.getId()).orElseThrow(() -> new IllegalArgumentException("해당 게시물이 존재하지 않습니다."));

        ChatRoom room = ChatRoom.builder()
                .posts(posts)
                .roomName(roomName)
                .creator(creator)
                .currentUserNumber(1) // 관리자 -> 1
                .maxUserNumber(maxUserNumber + 1) // posts/maxUserNumber + 관리자
                .build();

        return chatRoomRepository.save(room);
    }

    /**
     * 채팅방에 회원 초대
     * @param roomId 초대할 채팅방
     * @param invitedUserIds 초대할 회원 Id 리스트
     * @return 초대된 채팅방
     */
    @Transactional
    public ChatRoom inviteUser(Long roomId, List<Long> invitedUserIds) {
        log.info("roomId: {}", roomId);
        log.info("invitedUserIds: {}", invitedUserIds);
        List<User> invitedUsers = userRepository.findAllById(invitedUserIds);
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElseThrow(() -> new IllegalArgumentException("해당 커뮤니티가 존재하지 않습니다."));

        invitedUsers.forEach(user -> {
            if(chatRoom.getCurrentUserNumber() < chatRoom.getMaxUserNumber()) {
                if(chatRoom.getInvitedUsers().contains(user) || chatRoom.getCreator().equals(user)) {
                    throw new IllegalArgumentException("이미 초대된 사용자 입니다.");
                }
                // 1. 초대된 회원을 저장
                chatRoom.getInvitedUsers().add(user);
                // 2. 초대된 회원이 저장된 채팅방을 저장
                // 외래키 관리자(채팅방) -> 회원 -> 회원 엔티티의 초대된 채팅방 추가
                log.info("chatRoom.getInvitedUsers(): {}", chatRoom.getInvitedUsers());
                log.info("user.getInvitedUsersInChatRooms(): {}", user.getInvitedUsersInChatRooms());
                chatRoom.setCurrentUserNumber(chatRoom.getCurrentUserNumber() + 1);
            } else {
                throw new IllegalArgumentException("최대 회원수보다 더 많은 회원이 초대될 수 없습니다.");
            }
        });

        return chatRoom;
    }

    /**
     * 채팅방의 회원 삭제
     *
     * @param roomId         회원을 조회할 채팅방
     * @param invitedUserIds 삭제할 회원 Id 리스트
     */
    @Transactional
    public void removeUser(Long roomId, List<Long> invitedUserIds) {
        log.info("roomId: {}", roomId);
        log.info("invitedUserIds: {}", invitedUserIds);
        List<User> invitedUsers = userRepository.findAllById(invitedUserIds);
        ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElseThrow(() -> new IllegalArgumentException("해당 커뮤니티가 존재하지 않습니다."));
        invitedUsers.forEach(user -> {
            if(chatRoom.getInvitedUsers().stream().anyMatch(u -> u.getId().equals(user.getId())) || chatRoom.getCreator().getId().equals(user.getId())) {

                // 채팅방 -> 회원 제거
                chatRoom.getInvitedUsers().removeIf(u -> u.getId().equals(user.getId()));

                // 채팅방의 현재 회원수 -1
                chatRoom.setCurrentUserNumber(chatRoom.getCurrentUserNumber() - 1);

                chatRoom.getPosts().setCurrentUserNumber(chatRoom.getPosts().getCurrentUserNumber() - 1);
            }
        });
    }

    /**
     * 해당 회원이 초대된 채팅방 조회 메서드
     * @param user 현재 회원
     * @param pageable 페이지 정보
     * @param searchField 검색 필드
     * @param searchTerm 검색 단어
     * @param tab 현재 탭
     * @return 필터링된 채팅방 페이지 리스트
     */
    public Page<ChatRoomIndexResponse> index(User user, Pageable pageable, String searchField, String searchTerm, Integer tab) {

        Specification<ChatRoom> spec = ChatRoomSpec.search(user, searchField, searchTerm, tab);

        Page<ChatRoom> responseEntities = chatRoomRepository.findAll(spec, pageable);

        return responseEntities.map(item -> ChatRoomIndexResponse.builder()
                .id(item.getId())
                .roomName(item.getRoomName())
                .currentUserNumber(item.getCurrentUserNumber())
                .connectedUserNumber(roomChatHandler.getConnectedUserCount(item.getId()))
                .creator(item.getCreator().getUsername())
                .build());

    }

    /**
     * 채팅방 세부 정보 조회 메서드
     * @param user 현재 회원
     * @param roomId 세부 정보 조회할 채팅방 ID
     * @return 채팅방 세부 정보(초대된 회원 + 접속된 회원 등)
     * @throws IllegalAccessException
     */
    public ChatRoomShowResponse show(User user, Long roomId) throws IllegalAccessException {

        // 영속 상태 통일
        User findedUser = userRepository.findById(user.getId()).orElseThrow(() -> new IllegalArgumentException("해당 사용자를 찾을 수 없습니다."));
        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> new IllegalArgumentException("해당 커뮤니티를 찾을 수 없습니다."));

        if(room.getCreator().equals(findedUser) || room.getInvitedUsers().contains(findedUser)) {

            // 초대된 회원 목록 및 접속된 회원 조회
            List<UsernameAndIsConnectedResponse> usernameAndIsConnectedResponse = new ArrayList<>();
            usernameAndIsConnectedResponse.add(UsernameAndIsConnectedResponse.builder().username(room.getCreator().getUsername()).connected(roomChatHandler.isConnected(roomId, room.getCreator().getUsername())).build());
            room.getInvitedUsers().forEach(item -> usernameAndIsConnectedResponse.add(UsernameAndIsConnectedResponse.builder().username(item.getUsername()).connected(roomChatHandler.isConnected(roomId, item.getUsername())).build()));

            return ChatRoomShowResponse.builder()
                    .roomName(room.getRoomName())
                    .usernameAndIsConnectedResponse(usernameAndIsConnectedResponse)
                    .build();
        }
        throw new IllegalAccessException("초대되지 않은 커뮤니티에는 입장할 수 없습니다.");
    }
}
