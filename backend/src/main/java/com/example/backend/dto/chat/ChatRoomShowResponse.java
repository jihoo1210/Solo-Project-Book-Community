package com.example.backend.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ChatRoomShowResponse {

    private String roomName;
    private List<UsernameAndIsConnectedResponse> usernameAndIsConnectedResponse;
}
