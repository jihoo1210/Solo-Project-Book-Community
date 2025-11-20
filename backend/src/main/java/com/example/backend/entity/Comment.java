package com.example.backend.entity;

import com.example.backend.entity.utilities.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter

@Entity
public class Comment extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 댓글 내용
    @Setter
    @Column
    private String content;

    // 작성자
    @ManyToOne
    private User user;

    // 게시글 정보
    @ManyToOne
    private Posts posts;

    // 댓글 즐겨찾기 수 조회용
    @Builder.Default
    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommentLikes> likes = new ArrayList<>();

    // 수정된 날짜
    @Setter
    @Column
    private LocalDateTime modifiedDate;

    // 알림 정보
    // 댓글 삭제 -> 알림 삭제(cascade.ALL)
    @Builder.Default
    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Alert> alertList = new ArrayList<>();

    // 신고 정보
    // 댓글 삭제 -> 신고 삭제(cascade.ALL)
    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Report> report;
}
