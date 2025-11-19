package com.example.backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserIndexResponse {
    private Long id;
    private String email;
    private String username;
    private LocalDateTime createdDate;
}
