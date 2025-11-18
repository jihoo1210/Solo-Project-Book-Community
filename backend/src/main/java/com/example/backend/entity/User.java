package com.example.backend.entity;

import com.example.backend.entity.utilities.Role;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Entity(name = "USERS")
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    @Column
    private String username;

    @Column
    private String password;

    @Column
    private Role authority;

    // 외래키
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Alert> userAlertList;
    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Alert> senderAlertList;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<AlertViewed> alertViewedList;

    @OneToMany(mappedBy = "creator", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ChatRoom> chatRoomList;
    @ManyToMany(mappedBy = "invitedUsers", cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
    private List<ChatRoom> invitedUsersInChatRooms;
    @OneToMany(mappedBy = "writer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ChatRoomText> chatRoomTextList;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Comment> commentList;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CommentLikes> commentLikesList;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Posts> postsList;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PostsLikes> postsLikesList;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PostsViewed> postsViewedList;
}
