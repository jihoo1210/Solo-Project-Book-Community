package com.example.backend.dto.posts.show;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PostsShowResponse {
    private Long id;
    private String title;
    private String content;
    private String username;
    private LocalDateTime modifiedDate;
    private Long viewCount;
    private Long likeCount;
}
