package com.example.backend.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ChatRoomIndexResponse {

    private Long id;
    private String roomName;
    private String creator;
    private Integer currentUserNumber;
    private Integer connectedUserNumber;
}
