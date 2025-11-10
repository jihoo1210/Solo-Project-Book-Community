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
    private String subject;
    private String content;
    private String username;
    private LocalDateTime modifiedDate;
    private LocalDateTime createdDate;
    private Integer commentNumber;
    private Integer likes;
    private boolean savedInLikes;
}
