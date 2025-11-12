package com.example.backend.dto.alert;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class AlertIndexResponse {
    private Long id;
    private Long postsId;
    private String postsTitle;
    private String username;
    private boolean savedInViews;

    private String subject;
    private String content;

    private LocalDateTime createdDate;
}
