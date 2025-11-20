package com.example.backend.entity;

import com.example.backend.entity.utilities.BaseEntity;
import com.example.backend.entity.utilities.PostsSubject;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Entity
public class Posts extends BaseEntity {
    
    // 공통
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * RECRUIT("모집"),
     * QUESTION("질문"),
     * SHARE("공유");
     */
    // 게시글 주제
    @Column
    private PostsSubject subject;

    // 게시글 제목
    @Column
    private String title;

    // 게시글 내용
    @Lob
    private String content;

    // 게시글 작성자
    @ManyToOne
    private User user;

    // 게시글 좋아요
    @Builder.Default
    @OneToMany(mappedBy = "posts", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostsLikes> likes = new ArrayList<>();

    // 게시글 조회수
    @Builder.Default
    @Column
    private Long viewCount = 0L;

    // 댓글 목록
    // 게시글 삭제 -> 댓글 삭제
    @Builder.Default
    @OneToMany(mappedBy = "posts", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> commentList = new ArrayList<>();

    // 수정 날짜
    @Column
    private LocalDateTime modifiedDate;

    // 모집 게시글의 경우
    // 모집 지역
    @Column
    private String region;

    // 모집 날짜 및 시간 정보
    @Column
    private String meetingInfo;

    // 모집할 최대 인원 수
    @Column
    private Integer maxUserNumber;

    // 현재 인원 수
    @Builder.Default
    @Column
    private Integer currentUserNumber = 0;

    // 질문 게시글의 경우
    // 책 제목
    @Column
    private String bookTitle;

    // 참고할 책 페이지
    @Column
    private Integer pageNumber;

    // 질문 게시글 댓글
    // 한 게시글에 하나의 채택 댓글, 채택 댓글당 하나의 게시글
    // 외래키를 직접 관리함으로써 comment_list와 분리
    @Setter
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "adopted_comment_id")
    private Comment adoptedComment;

    // 신고 정보
    // 게시글 삭제 -> 신고 삭제
    @OneToMany(mappedBy = "posts", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Report> report;

    // 알림 정보
    // 게시글 삭제 -> 알림 삭제
    @OneToMany(mappedBy = "posts", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Alert> alertList;

    // 모집 글의 경우
    // 채팅방 정보
    // 게시글 삭제 -> 채팅방 삭제
    @OneToOne(mappedBy = "posts", cascade = CascadeType.ALL, orphanRemoval = true)
    private ChatRoom chatRoom;

    // 게시글 조회한 사용자 정보
    // 게시글 삭제 -> 조회한 사용자 정보 삭제
    @OneToMany(mappedBy = "posts", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostsViewed> postsViewedList;

}
