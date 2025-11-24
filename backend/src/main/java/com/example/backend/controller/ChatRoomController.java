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
@RequestMapping("/api/chatroom")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    /**
     * 채팅방 페이지 리스트를 가져오는 메서드
     * @param userDetails 회원 정보 - 자신이 속한 채팅방 페이지 조회용
     * @param pageable 페이지 정보
     * @param searchField 검색 필드
     * @param searchTerm 검색 단어
     * @param tab 현재 탭(관리자, 참가자)
     * @return 필터링된 채팅방 페이지
     */
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

    /**
     * 채팅방 세부 정보를 반환하는 메서드
     * @param userDetails 회원 정보 - 현재 사용자가 초대된 사용자이거나 관리자인지 확인
     * @param roomId 접속할 채팅방 ID
     * @return 채팅방 세부 정보
     */
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
