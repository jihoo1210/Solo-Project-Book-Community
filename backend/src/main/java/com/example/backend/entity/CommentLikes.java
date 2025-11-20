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
public class CommentLikes {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 댓글 정보
    @ManyToOne
    private Comment comment;

    // 즐겨찾기한 회원 정보
    @ManyToOne
    private User user;

    // 게시글 정보
    @ManyToOne
    private Posts posts;
}
