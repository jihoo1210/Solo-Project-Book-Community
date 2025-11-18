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

    @ManyToOne
    private User creator;

    @ManyToMany
    @JoinTable(
            name = "chat_room_invited_users",
            joinColumns = @JoinColumn(name = "chat_room_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> invitedUsers;

    // DB에 저장하지 않고 관리
/*    @Builder.Default
    @Transient
    private List<User> connectedUsers = new ArrayList<>();*/

    @OneToOne
    private Posts posts;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatRoomText> chatRoomTexts;

    @Builder.Default
    @Column
    private Integer maxUserNumber = 0;

    @Builder.Default
    @Column
    private Integer currentUserNumber = 0;
}
