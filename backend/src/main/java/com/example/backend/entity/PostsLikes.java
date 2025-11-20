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
public class PostsLikes {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 좋아요한 사용자
    @ManyToOne
    private User user;

    // 좋아요한 게시글
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Posts posts;
}
