package com.example.backend.dto.posts.show;

import com.example.backend.dto.comment.CommentResponse;
import com.example.backend.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PostsShowResponse {
    private Long id;
    private String subject;
    private String title;
    private String content;
    private String username;
    private LocalDateTime modifiedDate;
    private Long viewCount;
    private Integer likes;
    private boolean savedInLikes;
    private List<CommentResponse> comments;

    private String region;
    private String meetingInfo;

    private String bookTitle;
    private Integer pageNumber;
}
