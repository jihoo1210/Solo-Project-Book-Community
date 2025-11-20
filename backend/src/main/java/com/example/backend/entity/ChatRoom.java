package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data

@Entity
public class ChatRoom {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String roomName;

    // 관리자
    @ManyToOne
    private User creator;

    // 초대된 사용자
    @ManyToMany
    @JoinTable(
            name = "chat_room_invited_users",
            joinColumns = @JoinColumn(name = "chat_room_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> invitedUsers;

    // [모집] 게시글 정보
    @OneToOne
    private Posts posts;

    // 채팅방 내부 댓글
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatRoomText> chatRoomTexts;

    // 최대 인원수
    @Builder.Default
    @Column
    private Integer maxUserNumber = 0;

    // 현재 인원수
    @Builder.Default
    @Column
    private Integer currentUserNumber = 0;
}
