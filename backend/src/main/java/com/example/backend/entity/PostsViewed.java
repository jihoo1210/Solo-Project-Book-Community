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
public class PostsViewed {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 조회한 사용자
    @ManyToOne
    private User user;

    // 조회한 게시글
    @ManyToOne
    private Posts posts;
}
