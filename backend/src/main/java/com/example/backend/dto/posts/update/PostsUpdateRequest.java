package com.example.backend.dto.posts.update;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PostsUpdateRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String content;
}
