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

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<User> invitedUsers;

    // DB에 저장하지 않고 관리
    @Transient
    private List<User> connectedUsers;

    @OneToMany
    private List<ChatRoomText> chatRoomTexts;

    @Column
    private Integer maxUserNumber;

    @Column
    private Integer currentUserNumber;
}
