package com.example.backend.dto.comment.index;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class CommentIndexResponse {
    private Long id;
    private Long postId;
    private String postTitle;
    private String content;
    private LocalDateTime modifiedDate;
    private LocalDateTime createdDate;
}
