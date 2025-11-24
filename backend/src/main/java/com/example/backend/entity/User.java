package com.example.backend.entity;

import com.example.backend.entity.utilities.BaseEntity;
import com.example.backend.entity.utilities.Role;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Entity(name = "USERS")
public class User extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 이메일
    @Column(unique = true)
    private String email;

    // 회원명
    @Column
    private String username;

    // 비밀번호
    @Column
    private String password;

    // 권한
    @Column
    private Role authority;

    // 알림 정보 (받은이)
    // 회원 삭제 -> 알림 삭제
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Alert> userAlertList;
    // 알림 정보 (보낸이)
    // 회원 삭제 -> 알림 삭제
    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Alert> senderAlertList;
    // 알림 정보(조회 여부)
    // 회원 삭제 -> 알림 조회 여부 삭제
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<AlertViewed> alertViewedList;


    // 채팅방 정보(관리자)
    // 회원 삭제 -> 채팅방 삭제
    @OneToMany(mappedBy = "creator", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ChatRoom> chatRoomList;

    // 채팅방 정보(초대된 사용자)
    @Builder.Default
    @ManyToMany(mappedBy = "invitedUsers")
    private List<ChatRoom> invitedUsersInChatRooms = new ArrayList<>();

    // 채팅방 메시지 정보
    // 회원 삭제 -> 메시지 삭제
    @OneToMany(mappedBy = "writer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ChatRoomText> chatRoomTextList;


    // 댓글 정보
    // 회원 삭제 -> 댓글 삭제
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Comment> commentList;

    // 댓글 좋아요 정보
    // 회원 삭제 -> 댓글 좋아요 삭제
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CommentLikes> commentLikesList;


    // 게시글 정보
    // 회원 삭제 -> 게시글 삭제
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Posts> postsList;

    // 게시글 좋아요 정보
    // 회원 삭제 -> 게시글 좋아요 삭제
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PostsLikes> postsLikesList;

    // 게시글 조회 정보
    // 회원 삭제 -> 게시글 조회 정보 삭제
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PostsViewed> postsViewedList;

    // 신고 정보
    // 회원 삭제 -> 신고 삭제
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Report> reportList;
}
