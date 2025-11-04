package com.example.backend.entity;

import com.example.backend.entity.utilities.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

@Entity
public class Posts extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String title;

    @Lob
    private String content;

    @ManyToOne
    private User user;

    @Builder.Default
    @Column
    private Long likeCount = 0L;

    @Builder.Default
    @Column
    private Long viewCount = 0L;

    public void increaseViewCount() {
        this.viewCount = getViewCount() + 1;
    }

    public void increaseLikeCount() {
        this.likeCount = getLikeCount() + 1;
    }
}
