package com.example.backend.dto.posts.create;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PostsCreateRequest {

    @NotNull
    private String subject;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private String region;

    private String meetingInfo;

    private String bookTitle;

    private Integer pageNumber;

    private Integer maxUserNumber;
}
