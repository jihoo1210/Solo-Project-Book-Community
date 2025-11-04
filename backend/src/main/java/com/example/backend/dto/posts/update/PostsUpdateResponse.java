package com.example.backend.dto.posts.update;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PostsUpdateResponse {
    private Long id;
    private String title;
    private String content;
    private String username;
    private LocalDateTime modifiedDate;
    private Long likeCount;
    private Long viewCount;
}
