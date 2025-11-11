package com.example.backend.entity;

import com.example.backend.entity.utilities.AlertSubject;
import com.example.backend.entity.utilities.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter

@Entity
public class Alert extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private AlertSubject subject;

    // 게시글 작성자
    @ManyToOne
    private User user;

    // 답변 작성자
    @ManyToOne
    private User sender;

    @ManyToOne
    private Posts posts;

    @Column
    private String content;
}
