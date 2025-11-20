package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data

@Entity
public class Report {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 신고한 게시글
    @ManyToOne
    @JoinColumn(name = "posts_id")
    private Posts posts;

    // 신고한 댓글
    @ManyToOne
    @JoinColumn(name = "comment_id")
    private Comment comment;

    // 신고한 사용자
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
