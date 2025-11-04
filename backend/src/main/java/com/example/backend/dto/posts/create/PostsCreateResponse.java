package com.example.backend.dto.posts.create;

import com.example.backend.entity.utilities.Subject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PostsCreateResponse {
    private Long id;
    private Subject subject;
    private String title;
    private String content;
    private String username;
    private LocalDateTime modifiedDate;
    private Long viewCount;
    private Long likeCount;

    private String region;
    private String meetingInfo;

    private String bookTitle;
    private Integer pageNumber;
}
