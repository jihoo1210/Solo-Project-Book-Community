package com.example.backend.dto.comment.create;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class CommentCreateResponse {
    private Long id;
    private String content;
    private String username;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private Integer likes;
}
