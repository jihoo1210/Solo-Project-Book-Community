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

    @Setter
    @Column
    private String content;

    @ManyToOne
    private User user;

    @ManyToOne
    private Posts posts;

    @Builder.Default
    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommentLikes> likes = new ArrayList<>();

    @Setter
    @Column
    private LocalDateTime modifiedDate;

    @Builder.Default
    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Alert> alertList = new ArrayList<>();
}
