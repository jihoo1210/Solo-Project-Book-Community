package com.example.backend.dto.chat.text;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ChatRoomTextResponse {
    private String username;
    private String text;
    private LocalDateTime createdDate;
}
