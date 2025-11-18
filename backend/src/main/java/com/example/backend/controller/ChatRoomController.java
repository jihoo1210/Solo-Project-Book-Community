package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.chat.ChatRoomIndexResponse;
import com.example.backend.dto.chat.ChatRoomShowResponse;
import com.example.backend.entity.User;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/chatroom")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    @GetMapping
    public ResponseEntity<?> index (@AuthenticationPrincipal CustomUserDetails userDetails,
                                    @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                    @RequestParam(required = false, defaultValue = "") String searchField,
                                    @RequestParam(required = false, defaultValue = "") String searchTerm,
                                    @RequestParam(required = false, defaultValue = "0") Integer tab) {
        try {
            User user = userDetails.getUser();

            Page<ChatRoomIndexResponse> responseDto = chatRoomService.index(user, pageable, searchField, searchTerm, tab);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<?> show (@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long roomId) {
        try {
            User user = userDetails.getUser();
            ChatRoomShowResponse responseDto = chatRoomService.show(user, roomId);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }
}
