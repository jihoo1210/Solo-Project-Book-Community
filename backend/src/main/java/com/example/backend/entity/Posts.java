package com.example.backend.entity;

import com.example.backend.entity.utilities.BaseEntity;
import com.example.backend.entity.utilities.Subject;
import jakarta.persistence.*;
import lombok.*;

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
    private Subject subject;

    @Column
    private String title;

    @Lob
    private String content;

    @ManyToOne
    private User user;

    @Builder.Default
    @OneToMany(mappedBy = "posts", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostsLikes> likes = new ArrayList<>();

    @Builder.Default
    @Column
    private Long viewCount = 0L;

    // 모집 게시글
    @Column
    private String region;

    @Column
    private String meetingInfo;

    // 질문 게시글
    @Column
    private String bookTitle;

    @Column
    private Integer pageNumber;
    
    public void increaseViewCount() {
        this.viewCount = getViewCount() + 1;
    }
}
