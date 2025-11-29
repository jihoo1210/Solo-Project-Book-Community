package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.chat.text.ChatRoomTextResponse;
import com.example.backend.service.ChatRoomTextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/chatroom/text")
public class ChatRoomTextController {

    private final ChatRoomTextService chatRoomTextService;

    /**
     * 채팅방 최근 25개의 메시지를 반환하는 메서드
     * @param roomId 반환받을 채팅방 ID
     * @return 최근 25개의 메시지
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getTextTop25(@PathVariable Long roomId) {
        try {
            List<ChatRoomTextResponse> responseDtos = chatRoomTextService.getMessage(roomId);
            return ResponseController.success(responseDtos);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }
}
