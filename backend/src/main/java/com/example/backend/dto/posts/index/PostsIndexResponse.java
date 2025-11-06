package com.example.backend.dto.posts.index;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PostsIndexResponse {
    private Long id;
    private String subject;
    private String title;
    private String username;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private Long viewCount;
    private Integer likes;
    private boolean savedInLikes;
}
