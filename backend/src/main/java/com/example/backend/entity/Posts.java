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

    @Column
    private PostsSubject subject;

    @Column
    private String title;

    @Lob
    private String content;

    @ManyToOne
    private User user;

    // 좋아요
    @Builder.Default
    @OneToMany(mappedBy = "posts", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostsLikes> likes = new ArrayList<>();

    // 조회수
    @Builder.Default
    @Column
    private Long viewCount = 0L;

    // 댓글
    @Builder.Default
    @OneToMany(mappedBy = "posts", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    // 수정됨
    @Column
    private LocalDateTime modifiedDate;

    // 모집 게시글
    @Column
    private String region;

    @Column
    private String meetingInfo;

    // 모집 게시글 댓글

    // 질문 게시글
    @Column
    private String bookTitle;

    @Column
    private Integer pageNumber;

    // 질문 게시글 댓글
    // 한 게시글에 하나의 채택 댓글, 채택 댓글당 하나의 게시글
    @Setter
    @OneToOne
    private Comment adoptedComment;

    public void increaseViewCount() {
        this.viewCount = getViewCount() + 1;
    }
}
